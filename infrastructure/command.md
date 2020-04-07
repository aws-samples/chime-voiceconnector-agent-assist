# Search deployment instruction

## Use [AWS Command Line Interface](https://aws.amazon.com/cli/) to deploy the sample

1. Configure AWS Command Line Interface
    ```
    aws configure
    ```

2. Create S3 bucket to upload the lambda code
    ```
    aws s3api create-bucket --bucket source-us-east-1-<accountid> --region us-east-1
    ```

3. Zip functions for cloudformation deployment
    ```
    chmod u+x ./zip-lambda-function.sh && ./zip-lambda-function.sh
    ```

4. Package local artifacts
    ```
    aws cloudformation package --template-file ./deployment-template.json --s3-bucket source-us-east-1-<accountid> --force-upload --use-json --output-template-file packaged.json
    ```

5. Deploy the package. 

    ```
    aws cloudformation deploy --template-file ./packaged.json --stack-name chime-elasticsearch --capabilities CAPABILITY_IAM --region us-east-1
    ```

6. Deploy the S3 bucket notification config. This step will enable the object creation to trigger the lambda function. Note: Replace `<replace_with_cdr_bucket_name>` with CDR bucket name. Replace `<replace_with_audio_bucket_name>` with Audio bucket name. Replace `<your_aws_account_number>` with your AWS account.
CDR bucket:

    ```
    ACCOUNT=<your_aws_account_number>
    CDR_BUCKET_NAME=<replace_with_cdr_bucket_name>
    CDR_STREAMING_FUNCTION_ARN=arn:aws:lambda:us-east-1:"$ACCOUNT":function:chime-cdr-streaming

    cat > cdr_bucket_notification.json << EOF
    {
        "LambdaFunctionConfigurations": 
        [
            {
              "LambdaFunctionArn": "$CDR_STREAMING_FUNCTION_ARN",
              "Events": ["s3:ObjectCreated:*"],
              "Filter": {
                "Key": {
                  "FilterRules": [
                    {
                      "Name": "prefix",
                      "Value": "Amazon-Chime-Voice-Connector-CDRs"
                    }
                  ]
                }
              }
            }
        ]
    }
    EOF

    aws lambda add-permission --function-name chime-cdr-streaming --action lambda:InvokeFunction --statement-id s3-streaming --principal s3.amazonaws.com --source-arn arn:aws:s3:::$CDR_BUCKET_NAME --source-account $ACCOUNT
    aws s3api put-bucket-notification-configuration --bucket $CDR_BUCKET_NAME --notification-configuration file://cdr_bucket_notification.json
    ```

    Streaming audio bucket:

    ```
    ACCOUNT=<your_aws_account_number>
    AUDIO_BUCKET_NAME=<replace_with_audio_bucket_name>
    AUDIO_BUCKET_STREAMING_FUNCTION_ARN=arn:aws:lambda:us-east-1:"$ACCOUNT":function:chime-s3-audio-streaming

    cat > audio_bucket_notification.json << EOF
    {
        "LambdaFunctionConfigurations": 
        [
            {
                "LambdaFunctionArn": "$AUDIO_BUCKET_STREAMING_FUNCTION_ARN",
                "Events": ["s3:ObjectCreated:*"]
            }
        ]
    }
    EOF

    aws lambda add-permission --function-name chime-s3-audio-streaming --action lambda:InvokeFunction --statement-id s3-streaming --principal s3.amazonaws.com --source-arn arn:aws:s3:::$AUDIO_BUCKET_NAME --source-account $ACCOUNT
    aws s3api put-bucket-notification-configuration --bucket $AUDIO_BUCKET_NAME --notification-configuration file://audio_bucket_notification.json
    ```