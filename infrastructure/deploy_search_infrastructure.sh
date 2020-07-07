# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

#!/bin/bash
set -e

zip_lambda_function () {
    # Download pydub for retrieveMergedAudioUrl function
    if [ -z "$(git --version)" ]; then
      echo "Exit... Please install git"
      exit 0
    fi

    echo "Download pydub for retrieveMergedAudioUrl function..."
    REPOSITORY=https://github.com/jiaaro/pydub.git
    git clone $REPOSITORY $INFRASTRUCTURE_DIR/pydub && cp -r $INFRASTRUCTURE_DIR/pydub/pydub $INFRASTRUCTURE_DIR/function/src/retrieveMergedAudioUrl

    # Zip files
    echo "Start zipping function..."
    if [ ! -d $INFRASTRUCTURE_DIR/function/build ]; then
      echo "Creating build folder..."
      mkdir $INFRASTRUCTURE_DIR/function/build
    elif [ "$(ls -A $INFRASTRUCTURE_DIR/function/build)" ]; then
      echo "Remove old build files..."
      rm $INFRASTRUCTURE_DIR/function/build/*
    fi
    for folder in $(ls $INFRASTRUCTURE_DIR/function/src); do
      cd $INFRASTRUCTURE_DIR/function/src/$folder
      if [ "$(ls -A .)" ]; then
        zip -r $INFRASTRUCTURE_DIR/function/build/$folder.zip *
      else
        echo $INFRASTRUCTURE_DIR/function/src/$folder "is empty"
      fi
      cd $INFRASTRUCTURE_DIR
    done

    # Clean up
    echo "Cleaning up " $INFRASTRUCTURE_DIR/pydub
    rm -rf $INFRASTRUCTURE_DIR/pydub
}

set_s3_notification_for_audio_bucket () {
    AUDIO_BUCKET_NAME=callrecordings-us-east-1-$ACCOUNT
    AUDIO_BUCKET_STREAMING_FUNCTION_ARN=arn:aws:lambda:us-east-1:"$ACCOUNT":function:chime-s3-audio-streaming

    cat << EOF > audio_bucket_notification.json
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

#    aws lambda add-permission --function-name chime-s3-audio-streaming --action lambda:InvokeFunction --statement-id s3-streaming --principal s3.amazonaws.com --source-arn arn:aws:s3:::$AUDIO_BUCKET_NAME --source-account $ACCOUNT || true
    aws s3api put-bucket-notification-configuration --bucket $AUDIO_BUCKET_NAME --notification-configuration file://audio_bucket_notification.json

    rm -rf audio_bucket_notification.json
}

echo "Trying to get your account number from environment credential..."
aws sts get-caller-identity && ACCOUNT=$(aws sts get-caller-identity | jq -r ".Account") || (echo "Failed to get your account, please enter your AWS account number" && read $ACCOUNT)

S3_BUCKET_NAME=source-us-east-1-$ACCOUNT
ROOT_DIR=$(pwd)
INFRASTRUCTURE_DIR=$ROOT_DIR/infrastructure

echo "Creating S3 Bucket..."
#aws s3api create-bucket --bucket $S3_BUCKET_NAME --region us-east-1

echo "Zipping Lambda functions..."
zip_lambda_function

echo "Creating CloudFormation deployment template..."
aws cloudformation package --template-file $INFRASTRUCTURE_DIR/deployment-template.json --s3-bucket $S3_BUCKET_NAME --force-upload --use-json --output-template-file packaged.json

echo "Deploying..."
aws cloudformation deploy --template-file $INFRASTRUCTURE_DIR/packaged.json --stack-name chime-elasticsearch --capabilities CAPABILITY_IAM --region us-east-1

echo "Configuring s3 notification..."
set_s3_notification_for_audio_bucket
