// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import AWS from 'aws-sdk';
import { Auth } from 'aws-amplify';

import awsExports from '../aws-exports';

const defaultRegion = awsExports.aws_project_region;
AWS.config.update({ region: defaultRegion });

export function getMergedAudioURL(bucket, oneAudioObject, otherAudioObject, transactionId) {
  return Auth.currentCredentials().then(creds => {
    const lambda = new AWS.Lambda({
      region: defaultRegion,
      credentials: Auth.essentialCredentials(creds),
    });

    const params = {
      FunctionName: 'chime-retrieve-merged-audio-url',
      InvocationType: 'RequestResponse',
    };

    params['Payload'] = Buffer.from(
      JSON.stringify({
        bucket: bucket,
        oneAudioObject: oneAudioObject,
        otherAudioObject: otherAudioObject,
        transactionId: transactionId,
      })
    );
    return lambda
      .invoke(params)
      .promise()
      .then(data => {
        const body = JSON.parse(data.Payload).body;
        if (body !== undefined) {
          const urlFromLambda = body.url;

          if (urlFromLambda === undefined) {
            return '';
          }
          return urlFromLambda;
        } else {
          return '';
        }
      });
  });
}
