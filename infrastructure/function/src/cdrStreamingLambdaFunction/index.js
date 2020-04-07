// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');
const esDomain = {
    endpoint: process.env.ES_ENDPOINT,
    region: process.env.REGION,
    index: 'cdr',
    doctype: '_doc'
};
const s3 = new AWS.S3({signatureVersion: 'v4'});
const endpoint = new AWS.Endpoint(esDomain.endpoint);
exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify('Response message'),
  };
  if(event.Records.length > 1) {
    response.body = JSON.stringify('event record greater than 1');
    return response;
  }
  const r = event.Records[0];
  if(r.eventName !== 'ObjectCreated:Put') {
    response.body = JSON.stringify('only process insert record');
    return response;
  }
  const bucket = r.s3.bucket.name, encodekey = r.s3.object.key, size = r.s3.object.size;
  const decodekey = decodeURIComponent(encodekey.replace(/\\+/g, '%20'));
  if(size === 0) {
    response.body = JSON.stringify('only process non-zero size file');
    return response;
  }
  const req = await s3.getObject({
      Bucket: bucket,
      Key: decodekey
  }).promise();
  const metafile = JSON.parse(req.Body.toString());
  if(metafile.TransactionId === undefined) {
    response.body = JSON.stringify('transaction id not found in metafile');
    return response;
  }
  await postDocumentToES(metafile, metafile.TransactionId, context);
  response.body = JSON.stringify('success');
};
function postDocumentToES(doc, id, context) {
    return new Promise(() => {
        const req = new AWS.HttpRequest(endpoint);
        req.method = 'POST';
        req.path += esDomain.index + '/' + esDomain.doctype + '/' + id;
        req.region = esDomain.region;
        req.body = JSON.stringify(doc);
        req.headers['presigned-expires'] = false;
        req.headers['Host'] = endpoint.host;
        req.headers['Content-Type'] = 'application/json';
        req.headers['Content-Length'] = req.body.length;
        const signer = new AWS.Signers.V4(req, 'es');
        const creds = new AWS.EnvironmentCredentials('AWS');
        signer.addAuthorization(creds, new Date());
        const client = new AWS.HttpClient();
        client.handleRequest(req, null, function(httpResp) {
            let body = '';
            httpResp.on('data', function (chunk) {
                body += chunk;
            });
            httpResp.on('end', function () {
                context.succeed({'status': 1, 'message': body});
                console.log(body);
            }, function(err) {
                console.log(err);
            });
        });
    });
}