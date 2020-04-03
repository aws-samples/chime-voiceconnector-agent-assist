// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');
const esDomain = {
    endpoint: process.env.ES_ENDPOINT,
    region: process.env.REGION
};
const endpoint = new AWS.Endpoint(esDomain.endpoint);
exports.handler = function (event, context) {
  const {index,type,body,output} = event;
  const response = {
    statusCode: 200,
    body: JSON.stringify('Response message'),
  };
  searchDocumentToES(body, index, type, output, context);
  return response;
};
function pick(m, fields) {
  const res = {};
  fields.forEach(key => {
    res[key] = m[key];
  });
  return res;
}
function searchDocumentToES(body, index, type, output, context) {
    const req = new AWS.HttpRequest(endpoint);
    req.method = 'POST';
    req.path += index + '/_search';
    req.region = esDomain.region;
    req.body = JSON.stringify(body);
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
          const res = {'Records': []};
          JSON.parse(body).hits.hits.forEach(h => {
              if(output.length === 0) {
                res.Records.push(h._source);
              } else {
                res.Records.push(pick(h._source, output));
              }
          });
          context.succeed({'status': 200, 'body': res});
          console.log(body);
      }, function(err) {
          console.error(err);
      });
    });
}