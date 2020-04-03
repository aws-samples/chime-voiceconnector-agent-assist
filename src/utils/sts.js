// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import AWS from 'aws-sdk';
import { Auth } from 'aws-amplify';

import awsExports from '../aws-exports';

const defaultRegion = awsExports.aws_project_region;
AWS.config.update({ region: defaultRegion });

export function getAWSAccountId() {
  return Auth.currentCredentials().then(creds => {
    const sts = new AWS.STS({
      region: defaultRegion,
      credentials: Auth.essentialCredentials(creds),
    });
    return sts.getCallerIdentity({}).promise();
  });
}
