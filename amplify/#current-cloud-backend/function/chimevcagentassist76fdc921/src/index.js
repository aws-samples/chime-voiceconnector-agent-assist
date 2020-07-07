/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION
var apiChimeagentassistGraphQLAPIIdOutput = process.env.API_CHIMEAGENTASSIST_GRAPHQLAPIIDOUTPUT
var apiChimeagentassistGraphQLAPIEndpointOutput = process.env.API_CHIMEAGENTASSIST_GRAPHQLAPIENDPOINTOUTPUT

Amplify Params - DO NOT EDIT */

'use strict';
const URL = require('url');
const https = require('https');
const AWS = require('aws-sdk');
const GRAPHQL_API = process.env.API_CHIMEAGENTASSIST_GRAPHQLAPIENDPOINTOUTPUT;
const API_KEY = process.env.API_KEY;
let pendingCount = 0;
function waitOnComplete(waitBetweenChecksMillis, f) {
  let intervalHandle = setInterval(function() {
    if (pendingCount == 0) {
      clearInterval(intervalHandle);
      console.log(`waitOnComplete:  pendingCount is ${pendingCount}; calling handler ...`);
      f.call();
    } else {
      console.log(`waitOnComplete:  pendingCount is ${pendingCount}; waiting ...`);
    }
  }, waitBetweenChecksMillis);
}
async function announce(postData) {
  const uri = URL.parse(GRAPHQL_API);
  const options = {
    hostname: uri.hostname,
    port: 443,
    path: uri.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
  };
  pendingCount++;
  console.log(`announce:  pendingCount = ${pendingCount}`);
  console.log(`starting post ... ${JSON.stringify(options)}`);
  let req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    res.on('data', d => {
      console.log(`gql-response:  ${d.toString()}`);
    });
    res.on('end', () => {
      pendingCount--;
    });
  });
  req.on('error', e => {
    console.error(e);
    pendingCount--;
  });
  req.write(JSON.stringify(postData));
  req.end();
}
exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  event.Records.forEach(record => {
    if (record.eventName === 'INSERT') {
      console.log('record ... ');
      let transactionId = record.dynamodb.NewImage.TransactionId.S,
        startTime = parseFloat(record.dynamodb.NewImage.StartTime.N),
        transcript = record.dynamodb.NewImage.Transcript.S,
        loggedOn = record.dynamodb.NewImage.LoggedOn.S,
        callId = record.dynamodb.NewImage.CallId.S;
      let endTime = record.dynamodb.NewImage.EndTime
        ? parseFloat(record.dynamodb.NewImage.EndTime.N)
        : null;
      let speaker = record.dynamodb.NewImage.Speaker ? record.dynamodb.NewImage.Speaker.S : null;
      let announceAddTranscriptSegment = endTime
        ? `mutation announceAddTranscriptSegment {
              announceCreateTranscriptSegment
              (input: {
                TransactionId: "${transactionId}"
                StartTime: ${startTime}
                Speaker: "${speaker}"
                EndTime: ${endTime}
                Transcript: "${transcript}"
                LoggedOn: "${loggedOn}"
                CallId: "${callId}"
              }) {
                TransactionId
                StartTime
                Speaker
                EndTime
                Transcript
                LoggedOn
                CallId
              }
            }`
        : `mutation announceAddTranscriptSegment {
              announceCreateTranscriptSegment
              (input: {
                TransactionId: "${transactionId}"
                StartTime: ${startTime}
                Transcript: "${transcript}"
                LoggedOn: "${loggedOn}"
              }) {
                TransactionId
                StartTime
                Transcript
                LoggedOn
              }
            }`;
      announce({ query: announceAddTranscriptSegment });
    }
  });
  waitOnComplete(500, () => {
    return `Successfully processed ${event.Records.length} records.`;
  });
};
