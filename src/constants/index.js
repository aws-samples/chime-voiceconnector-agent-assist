// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// ---- Transcript Table start ----
// Name of DynamoDB table which stores transcript
export const TRANSCRIPT_TABLE_NAME = 'TranscriptSegment';

// Key name for transcript table
export const TRANSCRIPT_TABLE_KEYS = {
  TRANSACTION_ID: 'TransactionId',
  CALL_ID: 'CallId',
  START_TIME: 'StartTime',
  SPEAKER: 'Speaker',
  END_TIME: 'EndTime',
  SEGMENT_ID: 'SegmentId',
  TRANSCRIPT: 'Transcript',
  LOGGED_ON: 'LoggedOn',
  IS_PARTIAL: 'IsPartial',
  IS_FINAL: 'IsFinal',
};
// ---- Transcript Table end ----

// ---- Search start ----
// Name of Lambda function
export const SEARCH_LAMBDA_FUNCTION_NAME = 'chime-search-transcript-and-audio';
export const MERGE_AUDIO_LAMBDA_FUNCTION_NAME = 'chime-retrieve-merged-audio-url';

// Keywords that are considered for search
export const CDR_KEYWORD_PARAMETERS = [
  'AwsAccountId',
  'VoiceConnectorId',
  'SourcePhoneNumber',
  'DestinationPhoneNumber',
];

// Max number of result per one search returned by elastic search
export const MAX_RESULT = 10;

// Search index
export const ELASTIC_SEARCH_INDEX_NAMES = {
  WAVFILE: 'wavfile',
  CDR: 'cdr',
  METADATA: 'metadata',
  TRANSCRIPT: 'transcript',
};
// ---- Search end ----
