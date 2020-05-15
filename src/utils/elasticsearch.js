// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import AWS from 'aws-sdk';
import { Auth } from 'aws-amplify';

import awsExports from '../aws-exports';
import {
  SEARCH_LAMBDA_FUNCTION_NAME,
  TRANSCRIPT_TABLE_NAME,
  MAX_RESULT,
  TRANSCRIPT_TABLE_KEYS,
  ELASTIC_SEARCH_INDEX_NAMES,
} from '../constants';

const defaultRegion = awsExports.aws_project_region;
AWS.config.update({ region: defaultRegion });

const config = {
  searchFunctionName: SEARCH_LAMBDA_FUNCTION_NAME,
  transcriptTableName: TRANSCRIPT_TABLE_NAME,
  maxRecords: MAX_RESULT,
};

export function getSignedUrl(bucket, objectKey) {
  return Auth.currentCredentials().then(creds => {
    const s3 = new AWS.S3({
      region: defaultRegion,
      credentials: Auth.essentialCredentials(creds),
      signatureVersion: 'v4',
    });

    return s3.getSignedUrlPromise('getObject', { Bucket: bucket, Key: objectKey });
  });
}

export function retrieveBucketAndKey(transactionid) {
  return Auth.currentCredentials().then(creds => {
    const lambda = new AWS.Lambda({
      region: defaultRegion,
      credentials: Auth.essentialCredentials(creds),
    });
    const params = {
      FunctionName: config.searchFunctionName,
      InvocationType: 'RequestResponse',
    };

    const esParams = {
      index: ELASTIC_SEARCH_INDEX_NAMES.WAVFILE,
      type: '_doc',
      body: {
        size: 2,
        query: {
          query_string: {
            default_field: TRANSCRIPT_TABLE_KEYS.TRANSACTION_ID,
            query: transactionid,
          },
        },
      },
      output: ['Bucket', 'Key', 'Time'],
    };
    params['Payload'] = Buffer.from(JSON.stringify(esParams));

    return lambda
      .invoke(params)
      .promise()
      .then((data) => {
        const body = JSON.parse(data.Payload).body;
        if (body === undefined || body === []) {
          return [];
        }
        return JSON.parse(data.Payload).body.Records;
      });
  });
}

export function retrieveTranscriptForTransactionId(transactionId) {
  return Auth.currentCredentials().then(creds => {
    const ddb = new AWS.DynamoDB.DocumentClient({
      region: defaultRegion,
      credentials: Auth.essentialCredentials(creds),
    });

    const params = {
      TableName: config.transcriptTableName,
      KeyConditionExpression: '#id = :id',
      ExpressionAttributeNames: {
        '#id': TRANSCRIPT_TABLE_KEYS.TRANSACTION_ID,
      },
      ExpressionAttributeValues: {
        ':id': transactionId,
      },
    };

    return ddb
      .query(params)
      .promise()
      .then((data) => {
        if (data.Count === 0) {
          return [];
        }

        return data.Items.filter(item => item.IsFinal !== true);
      });
  });
}

export function queryCall(keyword) {
  return Promise.all([queryTranscriptKeyword(keyword), queryMetadataForKeyword(keyword)]).then(results => {
      // First step: find transaction id of the call that is correlated to the keyword.
      console.log("first step ", results);
      const transcriptionPromises = results[0], metadataPromises = results[1];
      return Promise.all([keyword,
        transcriptionPromises.map(d => {
          return queryMetadataForKeyword(d.TransactionId).then(metadata => {
            // Metadata should correlate with only one transactionId.
            if (metadata.length === 1) {
              return metadata[0];
            }
          });
        }),
        metadataPromises
      ]);
    }).then(promise => {
      // Second step: extract data for frontend.
      console.log("metadata ", promise);
      const metadata = [...promise[1], ...promise[2]]
      const result = metadata.map(d => {
        const fromNumber = (d.fromNumber !== undefined || d.fromNumber !== null) ? d.fromNumber : "Unknown";
        return {
          TransactionId: d.transactionId,
          Direction: d.direction,
          StartTimeEpochSeconds: Math.ceil(new Date(d.startTime) / 1000),
          EndTimeEpochSeconds: Math.ceil(new Date(d.endTime) / 1000),
          SourcePhoneNumber: fromNumber,
        }
      });

      return new Promise(resolve => resolve(result));
    })
}

function queryMetadataForKeyword(keyword) {
  return Auth.currentCredentials().then(creds => {
    const lambda = new AWS.Lambda({
      region: defaultRegion,
      credentials: Auth.essentialCredentials(creds),
    });

    const params = {
      FunctionName: config.searchFunctionName,
      InvocationType: 'RequestResponse',
    };

    const esParams = {
      index: ELASTIC_SEARCH_INDEX_NAMES.METADATA,
      type: '_doc',
      body: {
        size: config.maxRecords,
        sort: { startTime: { order: 'desc' } },
        query: {
          multi_match: {
            type: 'best_fields',
            query: keyword,
          },
        },
      },
      output: [],
    };

    params['Payload'] = Buffer.from(JSON.stringify(esParams));
    return lambda
      .invoke(params)
      .promise()
      .then((data) => {
        const body = JSON.parse(data.Payload).body;
        if (body === undefined || body === []) {
          return [];
        }
        return JSON.parse(data.Payload).body.Records;
      });
  });
}

export function queryTranscriptKeyword(keyword) {
  return Auth.currentCredentials().then(creds => {
    const lambda = new AWS.Lambda({
      region: defaultRegion,
      credentials: Auth.essentialCredentials(creds),
    });

    const params = {
      FunctionName: config.searchFunctionName,
      InvocationType: 'RequestResponse',
    };

    const esParams = {
      index: ELASTIC_SEARCH_INDEX_NAMES.TRANSCRIPT,
      type: '_doc',
      body: {
        size: config.maxRecords,
        query: {
          match: {
            Transcript: {
              query: keyword,
              operator: 'and',
            },
          },
        },
      },
      output: [],
    };

    params['Payload'] = Buffer.from(JSON.stringify(esParams));
    return lambda
      .invoke(params)
      .promise()
      .then((data) => {
        const body = JSON.parse(data.Payload).body;
        if (body === undefined || body === []) {
          return [];
        }
        return JSON.parse(data.Payload).body.Records;
      });
  });
}
