/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onAnnounceCreateTranscriptSegment = /* GraphQL */ `
  subscription OnAnnounceCreateTranscriptSegment(
    $input: CreateTranscriptSegmentInput
  ) {
    onAnnounceCreateTranscriptSegment(input: $input) {
      TransactionId
      CallId
      EndTime
      LoggedOn
      Speaker
      StartTime
      Transcript
    }
  }
`;
export const onCreateTranscriptSegment = /* GraphQL */ `
  subscription OnCreateTranscriptSegment(
    $TransactionId: String
    $StartTime: Float
  ) {
    onCreateTranscriptSegment(
      TransactionId: $TransactionId
      StartTime: $StartTime
    ) {
      TransactionId
      CallId
      EndTime
      LoggedOn
      Speaker
      StartTime
      Transcript
    }
  }
`;
export const onDeleteTranscriptSegment = /* GraphQL */ `
  subscription OnDeleteTranscriptSegment(
    $TransactionId: String
    $StartTime: Float
  ) {
    onDeleteTranscriptSegment(
      TransactionId: $TransactionId
      StartTime: $StartTime
    ) {
      TransactionId
      CallId
      EndTime
      LoggedOn
      Speaker
      StartTime
      Transcript
    }
  }
`;
export const onUpdateTranscriptSegment = /* GraphQL */ `
  subscription OnUpdateTranscriptSegment(
    $TransactionId: String
    $StartTime: Float
  ) {
    onUpdateTranscriptSegment(
      TransactionId: $TransactionId
      StartTime: $StartTime
    ) {
      TransactionId
      CallId
      EndTime
      LoggedOn
      Speaker
      StartTime
      Transcript
    }
  }
`;
