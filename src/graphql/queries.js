/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTranscriptSegment = /* GraphQL */ `
  query GetTranscriptSegment($TransactionId: String!, $StartTime: Float!) {
    getTranscriptSegment(TransactionId: $TransactionId, StartTime: $StartTime) {
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
export const listTranscriptSegments = /* GraphQL */ `
  query ListTranscriptSegments(
    $filter: TableTranscriptSegmentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTranscriptSegments(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        TransactionId
        CallId
        EndTime
        LoggedOn
        Speaker
        StartTime
        Transcript
      }
      nextToken
    }
  }
`;
