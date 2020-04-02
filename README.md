# AI-powered Speech Analytics with Amazon Chime Voice Connector

Making it easy to get started with Amazon Chime Voice Connector live audio streaming to build a AI-powered Speech Analytics using Amazon Transcribe, Amazon Comprehend and AWS Elastic Search. This example builds on top of previously released [AI-powered real-time transcriptions with Amazon Chime Voice Connecter](https://github.com/aws-samples/amazon-chime-voiceconnector-transcription) and create a solution to help care site agents in their typical workflows.

## On this Page
- [Project Overview](#project-overview)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)

## Project Overview

This project provides a frontend user interface to view call trasncritps, customer sentiment analysis, and next best action in near real-time for an ongoing call. It also shows integration with Amazon Elastic Search to enable searching thru previous trancritps using keywords or call metadata like To, From and Call-Ids etc.

The frontend user interface is comprised of two parts: Active call and search. In Active call, agent is able to track the real-time transcription, capture the keyobject and sentiment that are detected through AWS Comprehend. In Search, agent can retrieve the transcription and audios by specifying a keyword such as transcription, call detail record, metadata, etc.

## Architecture Overview
![](images/agent-assist.svg)

### Description
Chime Agent Assist consists of two parts. Search provides agents with access to previous transcriptions, metadata, call detail records, etc and allows agents to search thru th information. Once a keyword is entered, frontend will encapsulate the keyword in a query request and send it to the cluster. The cluster will return the result. At the same time, in-coming transcript, new call detail record and audio s3 object, metadata record from cloudwatch event will trigger the Lambda function, which later sends an index request to store the information for searching.

Active call enables agents to track the call transcription, capture the key object and customer's sentiment in real time. This is accomplished by a frontend subscribing to AppSync and a Lambda function triggered by new transcription record. AppSync, after receiving the Lambda request, will return the new transcription to the frontend.

## Getting Started
Getting started with this project is easy. This can be accomplished by using the Amplify deployment and cloudformation instructions below:

### Easy Setup

The simplest way to get started is to use the Amazon CloudFormation template instructions and Amplify CLI below to deploy resources required. You must ensure that you have an active Amazon Chime Voice Connector with the "Streaming" feature enabled by following the [Amazon Chime Voice Connector documentation](https://docs.aws.amazon.com/chime/latest/ag/start-kinesis-vc.html) for "Enable Streaming". Also you are expected to install the [Amazon Chime Voice Connector Transcription](https://github.com/aws-samples/amazon-chime-voiceconnector-transcription).

Once your deployment is complete, you can test by making calls through your Amazon Chime Voice Connector. You are expected to receive transcription as the call starts. And you are able to search the call based on the transcription, metadata, call detail records, etc. For example, you can search one or more words in the transcription, or search based on the phone number which starts the call.

### Building the project:

This step will provide a detailed steps on how to deploy the project.

### Prerequisite
- Successfully deployed [amazon-chime-voiceconnector-transcription]((https://github.com/aws-samples/amazon-chime-voiceconnector-transcription)) in you AWS account.
- Install [nvm](https://github.com/nvm-sh/nvm) and [npm](https://www.npmjs.com/get-npm), and configure correctly in your environment.
- Install Amplify Cli. [Documentation](https://aws-amplify.github.io/docs/)
- (Optional) Install yarn. [Install instruction](https://classic.yarnpkg.com/en/docs/install)
- Enable DynamoDB table streaming for the transcription table named `TranscriptSegment`. Note: choose StreamViewType as `NEW_IMAGE` or `NEW_AND_
OLD_IMAGES`. [Documentation on enabling streaming](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html#Streams.Enabling)

### Deploy with the AWS Amplify CLI

Download instruction:

1. [Download](https://github.com/aws-samples/chime-agent-assist) repository in your workspace.
2. Install the package dependency

    ```
    npm install
    ```
    or

    ```
    yarn
    ```
3. Configure Amplify

    ```
    amplify configure
    ```
4. Init Amplify workspace

    ```
    amplify init
    ```
5. Add DynamoDB streaming ARN in the configuration. Please replace `<replace_with_your_streaming_arn>` with the streaming arn in [Prerequisite](#prerequisite).

    ```
    cat > ./amplify/backend/function/chimevcagentassist76fdc921/parameters.json << EOF
    {
     "TranscriptSegmentTableStreamArn": "<replace_with_your_streaming_arn>",
     "TranscriptSegmentTableName": "TranscriptSegment"
    }
    EOF
    ```
6. Push backend infrastructure to the cloud

    ```
    amplify push
    ```
7. Install Search in `infrastructure/`. Please check the `command.md`.