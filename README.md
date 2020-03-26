# chime-vc-agentassist
## Prerequisite
### Dependency:
You have successfully deployed amazon-chime-voiceconnector-transcription in github. [Github Link](https://github.com/aws-samples/amazon-chime-voiceconnector-transcription)

### Dev Package:
You have install nvm and npm, and configure correctly in your environment.

### Resource:
* A Chime Voice Connector is created. And you have enabled streaming and configured the s3 bucket for Call detail record(CDR).
* A Dynamodb table is created as amazon-chime-voiceconnector-transcription got deployed. Table is named "TranscriptSegment" And DymamoDB streaming has been enabled for the table.
* S3 bucket for storing the audio has been created. The s3 bucket name is formatted as callrecording-<aws region>-<aws account>

## Deploy with the AWS Amplify CLI
1. Download package [here](https://github.com/zhizhongk/chime-vc-agentassist)
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
5. Fill in your DynamoDB table name and stream arn in parameters.json in backend/api and backend/function. Enable the DynamoDB table streaming with type "Old and new Images".
6. Push backend infrastructure to the cloud
```
amplify push
```
7. Publish to web 
```
amplify publish
```
8. Go to infrastructure/ and follow command.md there.
