# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from pydub import AudioSegment
import boto3
import json
from botocore.exceptions import ClientError
from botocore.client import Config
from datetime import datetime

s3_client = boto3.client('s3', config=Config(signature_version='s3v4'))

def lambda_handler(event, context):
    # event = json.loads(event);
    print(event)
    bucket, oneAudioObject, otherAudioObject, transactionId  = event['bucket'], event['oneAudioObject'], event['otherAudioObject'], event['transactionId']

    if(isMergedAlready(bucket, transactionId)):
        url = createPresignedUrl(bucket, transactionId + "_merged.wav");
        return {
            'statusCode': 200,
            'body': { 'url' : url }
        }
    
    if(oneAudioObject['Time'] > otherAudioObject['Time']):
        oneAudioObject, otherAudioObject = otherAudioObject, oneAudioObject
    
    durationMillis = getDuration(oneAudioObject['Time'], otherAudioObject['Time']) * 1000
    oneAudioAddr = "/tmp/" + oneAudioObject['Key']
    otherAudioAddre = "/tmp/" + otherAudioObject['Key']
    downloadFile(oneAudioAddr, bucket, oneAudioObject['Key'])
    downloadFile(otherAudioAddre, bucket, otherAudioObject['Key'])
    
    sound1 = AudioSegment.from_wav(oneAudioAddr)
    sound2 = AudioSegment.from_wav(otherAudioAddre)
    
    if(durationMillis > 100):
        paddingSilence = AudioSegment.silent(duration=durationMillis)
        sound2AfterPadding = paddingSilence.append(sound2);
        
        if(sound1.duration_seconds > sound2AfterPadding.duration_seconds):
            combined = sound1.overlay(sound2AfterPadding)
        else:
            combined = sound2AfterPadding.overlay(sound1)
    else:
        if(sound1.duration_seconds > sound2.duration_seconds):
            combined = sound1.overlay(sound2)
        else:
            combined = sound2.overlay(sound1)

    outputWav = "/tmp/" + transactionId + "_merged.wav"
    combined.export(outputWav, format='wav')
    upload_file(outputWav, bucket, transactionId + "_merged.wav")
    url = createPresignedUrl(bucket, transactionId + "_merged.wav");

    return {
        'statusCode': 200,
        'body': { 'url' : url }
    }

def isMergedAlready(bucket, transactionId):
  try:
      resp = s3_client.head_object(Bucket=bucket, Key=transactionId + '_merged.wav')
      print('resp is ', resp)
      return True
  except ClientError as e:
      return False
  
def getDuration(earlyTime, lateTime):
  datetime1 = datetime.strptime(earlyTime, '%Y-%m-%dT%H:%M:%S.%fZ')
  datetime2 = datetime.strptime(lateTime, '%Y-%m-%dT%H:%M:%S.%fZ')
  diff = datetime2 - datetime1

  print(diff.total_seconds())
  return diff.total_seconds()

def createPresignedUrl(bucket, key, expiration=3600):
  try:
      return s3_client.generate_presigned_url('get_object', Params={'Bucket': bucket, 'Key': key}, ExpiresIn=expiration)
  except ClientError as e:
      logging.error(e)
      return ''
   
def downloadFile(fileName, bucket, key):
  try:
      response = s3_client.download_file(bucket, key, fileName)
  except ClientError as e:
      logging.error(e)
      return False
  return True
  
def upload_file(fileName, bucket, object_name=None):
    if object_name is None:
        object_name = fileName

    try:
        response = s3_client.upload_file(fileName, bucket, object_name)
    except ClientError as e:
        logging.error(e)
        return False
    return True