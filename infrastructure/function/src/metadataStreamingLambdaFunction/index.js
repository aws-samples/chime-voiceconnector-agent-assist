// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');
const esDomain = {
    endpoint: process.env.ES_ENDPOINT,
    region: process.env.REGION,
    index: 'metadata',
    doctype: '_doc'
};
const endpoint = new AWS.Endpoint(esDomain.endpoint);
exports.handler = function (event, context) {
    console.log("event ", JSON.stringify(event));
    const response = {
      statusCode: 200,
      body: JSON.stringify('Succeed'),
    };
    const detail = event.detail;
    const transactionId = detail.transactionId;

    if(detail.streamingStatus === 'STARTED') {
        postDocumentToES(detail, transactionId, context);
    }
    return response;
};
function postDocumentToES(doc, id, context) {
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
}