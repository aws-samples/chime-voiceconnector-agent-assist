# AI-powered Speech Analytics with Amazon Chime Voice Connector

Making it easy to get started with Amazon Chime Voice Connector live audio streaming to build a AI-powered Speech Analytics using Amazon Transcribe, Amazon Comprehend and AWS Elastic Search. This example builds on top of previously released [Real-time transcription with Amazon Chime Voice Connecter](https://github.com/aws-samples/amazon-chime-voiceconnector-transcription) and create a solution to help care site agents in their typical workflows.

## On this Page
- [Project Overview](#project-overview)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)

## Project Overview
Chime Agent Assist provides an excellent user experience for [Amazon Chime Voice Connector Transcription](https://github.com/aws-samples/amazon-chime-voiceconnector-transcription). The frontend interface is comprised of two parts: Active call and Search. Active call allows customers to track the in-coming transcription from an active call. Key words and sentiment in the transcription are captured by AWS Comprehend and highlighted. Search allows customer to retrieve the call by specifying a related keyword such as keyword in the transcription, call detail record such as aws account, phone number, etc, metadata such as inviter header, media label, etc. Also audio from two legs can played and merged after the call is retrieved.

## Architecture Overview
![](images/agent-assist.svg)

### Description
Chime Voice Connector Agent Assist is configured with following resources: AWS Lambda, AWS Elasticsearch service, AWS S3, AWS Eventbridge, AWS DynamoDB, AWS AppSync and AWS Comprehend, etc. Chime Agent Assist consists of two parts and they are deployed with different tools. Active Call is configured and deployed using AWS Amplify. Search is deployed with AWS CloudFormation template and AWS Command Line Interface.

Active Call is configured with AWS AppSync, AWS Lambda and AWS DynamoDB.

When there is an in-flight call:
- (Step 1) A call is initialed and users starts to browse the Agent Assist, the connection to AppSync for transcription subscription is automatically established. 
- (Step 2) As the call continues, transcription segments from AWS Transcribe will be live streamed and stored in AWS DynamoDB table as records. 
- (Step 3) An AWS Lambda function with the table as event source, is triggered to bring the transcription segment to AWS AppSync. The transcription subscription will send the transcription segment back to the frontend interface. 
- (Step 4) The segment is sent to AWS Comprehend for keywords and sentiment detection. Then it will be displayed on the webpage.

When there is no call:
- (Step 1) The frontend sends a graphql query request to AWS AppSync to query all transcription segments. 
- (Step 2) AppSync lists segments for every call from DynamoDB table and send it back to the frontend. 
- (Step 3) The frontend filters out old calls and only display the latest call transcription. When the number of segment grows, AppSync and frontend will use pagination so that responses are easier to handle.

Search is configured with AWS ElasticSearch, AWS Lambda and AWS S3, AWS EventBridge and AWS DynamoDB. ElasticSearch cluster is indexed with multiple sources so that transcription, call detail record, metadata search and audio download are supported. Call detail record is a set of information which provides detail on the resource used, time, place of the call. It is stored in S3 bucket. Metadata is request data inside SIP Invite request and it is distributed throught Eventbridge. Transcription is stored in DynamoDB from [Amazon Chime Voice Connector Transcription](https://github.com/aws-samples/amazon-chime-voiceconnector-transcription). Call audios are stored in S3 bucket and the bucket and the key are indexed in cluster. If customer wants to play the audio, frontend will query the cluster for the s3 bucket and the key first, then send a request for presign url. Any new file, new record or new event will trigger a corresponding Lambda function to index the information to the cluster.

Search steps:
- (Step 1) Search keyword is entered.
- (Step 2) The frontend sends a elastic search query request to AWS Lambda. Lambda sends the request to the cluster.
- (Step 3) The cluster searches documents based on the keyword and returns a list of call `TransactionId` sorted by relevance.
- (Step 4) After getting the call `TransactionId`, the frontend will then query the transcription from DynamoDb table, audio from S3, and call details from ElasticSearch.

## Getting Started
Getting started with this project is easy. This can be accomplished by using the Amplify deployment and CloudFormation instructions below:

### Easy Setup

The simplest way to get started is to use the Amazon CloudFormation template instructions and Amplify CLI below to deploy resources required. You must ensure that you have an active Amazon Chime Voice Connector with the "Streaming" feature enabled by following the [Amazon Chime Voice Connector documentation](https://docs.aws.amazon.com/chime/latest/ag/start-kinesis-vc.html) for "Enable Streaming". Also you are expected to install the [Amazon Chime Voice Connector Transcription](https://github.com/aws-samples/amazon-chime-voiceconnector-transcription).

Once your deployment is complete, you can test by making calls through your Amazon Chime Voice Connector. You are expected to receive transcription as the call starts. And you are able to search the call based on the transcription, metadata, call detail records, etc. For example, you can search one or more words in the transcription, or search based on the phone number which starts the call.

### Building the project:

This step will provide a detailed steps on how to deploy the project.

### Prerequisite
- Install and configure [nvm](https://github.com/nvm-sh/nvm) and [npm](https://www.npmjs.com/get-npm)
- Follow [steps](https://aws-amplify.github.io/docs/) to install Amplify CLI
- [Real-time transcription with Amazon Chime Voice Connecter](https://github.com/aws-samples/amazon-chime-voiceconnector-transcription) is deployed in the AWS account

### Deploy with the AWS Amplify CLI

Download instruction:

1. Clone this repository
2. Install the package dependency

    ```
    npm install
    ```
3. Configure Amplify and AWS

    ```
    amplify configure
    ```
    and
    ```
    aws configure
    ```
4. Init Amplify workspace. Use the AWS profile you just created last step.
    ```
    amplify init
    ```
5. Push Active Call infrastructure to the cloud
    ```
    amplify push
    ```
6. Push Search infrastructure to the cloud
    ```
    chmod u+x ./infrastructure/deploy_search_infrastructure.sh && ./infrastructure/deploy_search_infrastructure.sh
    ```
7. Pull the environment config and publish the frontend to the cloud
    ```
    amplify pull && amplify publish
    ```
8. You are all set to experience the Chime Voice Connector Agent Assist! Navigate to the hosting endpoint(Use following command to check the endpoint) and register an admin account.
    ```
    amplify status
    ```