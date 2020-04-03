// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import AWS from 'aws-sdk';
import { Auth } from 'aws-amplify';

import awsExports from '../aws-exports';

const defaultRegion = awsExports.aws_project_region;
AWS.config.update({ region: defaultRegion });

const config = {
  searchFunctionName: 'chime-search-transcript-and-audio',
  transcriptTableName: 'TranscriptSegment',
  maxRecords: 10,
  cdrSearchableFields: [
    'AwsAccountId',
    'VoiceConnectorId',
    'SourcePhoneNumber',
    'DestinationPhoneNumber',
  ],
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
      index: 'wavfile',
      type: '_doc',
      body: {
        size: 2,
        query: {
          query_string: {
            default_field: 'TransactionId',
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
      .then(function(data) {
        const body = JSON.parse(data.Payload).body;
        if (body === undefined || body === []) {
          return [];
        }
        return JSON.parse(data.Payload).body.Records;
      });
  });
}

export function retrieveTranscriptForCallId(callid) {
  return Auth.currentCredentials().then(creds => {
    const ddb = new AWS.DynamoDB.DocumentClient({
      region: defaultRegion,
      credentials: Auth.essentialCredentials(creds),
    });

    const params = {
      TableName: config.transcriptTableName,
      KeyConditionExpression: '#id = :id',
      ExpressionAttributeNames: {
        '#id': 'CallId',
      },
      ExpressionAttributeValues: {
        ':id': callid,
      },
    };

    return ddb
      .query(params)
      .promise()
      .then(function(data) {
        if (data.Count === 0) {
          return [];
        }

        return data.Items.filter(item => item.IsFinal !== true);
      });
  });
}

export function queryCall(keyword) {
  // What can be the keyword? Transcript, metadata or CDR
  // If word can be found in transcript, return transcript
  //
  // If it can't be found in transcript:
  // Query metadata first. If we can find records, query cdr to find if the
  // call already ended. If it did, return cdr, otherwise return metadata.
  // If we cannot find anything in metadata, then the field queried is not included in metadata.
  // We will query CDR to find if any call could be found.
  return queryTranscriptKeyword(keyword).then(dataForTranscript => {
    if (dataForTranscript.length !== 0) {
      return Promise.all(
        dataForTranscript.map(d => {
          return queryCDRForTransactionId(d.TransactionId).then(cdr => {
            if (cdr.length !== 0) {
              return cdr[0];
            } else {
              return {
                TransactionId: 'Unknown Id',
                Direction: 'Unknown Direction',
                StartTimeEpochSeconds: Math.ceil(Date.now() / 1000),
                SourcePhoneNumber: 'Unknown Number',
              };
            }
          });
        })
      );
    } else {
      return queryMetadataForKeyword(keyword).then(dataList => {
        if (dataList.length !== 0) {
          return Promise.all(
            dataList.map(d => {
              return queryCDRForTransactionId(d.transactionId).then(cdr => {
                if (cdr.length === 0) {
                  return {
                    TransactionId: d.transactionId,
                    Direction: d.direction,
                    StartTimeEpochSeconds: Math.ceil(new Date(d.startTime) / 1000),
                    SourcePhoneNumber: 'In Call',
                  };
                } else {
                  return cdr[0];
                }
              });
            })
          );
        } else {
          return queryCDRForKeyword(keyword);
        }
      });
    }
  });
}

function queryCDRForTransactionId(transactionId) {
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
      index: 'cdr',
      type: '_doc',
      body: {
        size: 1,
        query: {
          query_string: {
            default_field: 'TransactionId',
            query: transactionId,
          },
        },
      },
      output: [],
    };

    esParams.highlight = { fields: {} };
    config.cdrSearchableFields.forEach(key => {
      esParams.highlight.fields[key] = {};
    });

    params['Payload'] = Buffer.from(JSON.stringify(esParams));
    return lambda
      .invoke(params)
      .promise()
      .then(function(data) {
        const body = JSON.parse(data.Payload).body;
        if (body === undefined || body === []) {
          return [];
        }
        return JSON.parse(data.Payload).body.Records;
      });
  });
}

function queryCDRForKeyword(keyword) {
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
      index: 'cdr',
      type: '_doc',
      body: {
        size: config.maxRecords,
        sort: { EndTimeEpochSeconds: { order: 'desc' } },
        query: {
          multi_match: {
            fields: config.cdrSearchableFields,
            type: 'best_fields',
            query: keyword,
            fuzziness: '2',
          },
        },
      },
      output: [],
    };

    esParams.highlight = { fields: {} };
    config.cdrSearchableFields.forEach(key => {
      esParams.highlight.fields[key] = {};
    });

    params['Payload'] = Buffer.from(JSON.stringify(esParams));
    return lambda
      .invoke(params)
      .promise()
      .then(function(data) {
        const body = JSON.parse(data.Payload).body;
        if (body === undefined || body === []) {
          return [];
        }
        return JSON.parse(data.Payload).body.Records;
      });
  });
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
      index: 'metadata',
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
      .then(function(data) {
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
      index: 'transcript',
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
      .then(function(data) {
        const body = JSON.parse(data.Payload).body;
        if (body === undefined || body === []) {
          return [];
        }
        return JSON.parse(data.Payload).body.Records;
      });
  });
}
