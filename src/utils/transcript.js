// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import AWS from 'aws-sdk';
import { Auth } from 'aws-amplify';

import awsExports from '../aws-exports';

const defaultRegion = awsExports.aws_project_region;
AWS.config.update({ region: defaultRegion });

function showKeyphrases(error, segment, index, keyphraseResponse) {
  if (error) {
    console.error(error);
  } else {
    if (Array.isArray(keyphraseResponse.KeyPhrases)) {
      keyphraseResponse.KeyPhrases.forEach(keyPhrase => {
        if (keyPhrase.Score > 0.75) {
          const row = document.getElementById('ttlist').tBodies[0].rows[index];
          if (row) {
            row.cells[4].innerHTML = row.cells[4].innerHTML.replace(
              keyPhrase.Text,
              `<span class="hl">${keyPhrase.Text}</span>`
            );
          }
        }
      });
    }
  }
}

function showSentiment(error, segment, index, sentimentResponse) {
  if (error) {
    console.error(error);
  } else {
    if (sentimentResponse.SentimentScore.Negative > 0.4) {
      segment.Sentiment = `-  ${sentimentResponse.SentimentScore.Negative.toFixed(2)}`;
      segment.SentimentClass = 's-minus';
    } else if (sentimentResponse.SentimentScore.Positive > 0.65) {
      segment.Sentiment = `+  ${sentimentResponse.SentimentScore.Positive.toFixed(2)}`;
      segment.SentimentClass = 's-plus';
    }
  }

  if (segment.SentimentClass) {
    const daRow = document.getElementById('ttlist').tBodies[0].rows[index];
    if (daRow) {
      daRow.cells[2].className = segment.SentimentClass;
      daRow.cells[2].innerText = segment.Sentiment;
    }
  }
}

export function mergeAndComprehendTranscript(segments) {
  const mergedSegments = mergeTranscript(segments);
  Auth.currentCredentials().then(credentials => {
    const Comprehend = new AWS.Comprehend({
      region: defaultRegion,
      credentials: Auth.essentialCredentials(credentials),
    });
    mergedSegments.forEach((segment, i) => {
      if (segment.Speaker !== 'spk_0') {
        const params = {
          LanguageCode: 'en',
          Text: segment.Transcript,
        };
        Comprehend.detectSentiment(params, (error, sentimentResponse) => {
          showSentiment(error, segment, i, sentimentResponse);
        });
        Comprehend.detectKeyPhrases(params, (error, keyphraseResponse) => {
          showKeyphrases(error, segment, i, keyphraseResponse);
        });
      }
    });
  });
  return mergedSegments;
}

export function mergeTranscript(segments) {
  segments.sort(function(a, b) {
    if (a.CallId < b.CallId) {
      return -1;
    } else if (a.CallId > b.CallId) {
      return 1;
    } else {
      return a.LoggedOn - b.LoggedOn;
    }
  });
  const mergedSegments = [];
  segments.forEach(segment => {
    if (
      mergedSegments.length > 0 &&
      mergedSegments[mergedSegments.length - 1].Speaker === segment.Speaker
    ) {
      mergedSegments[mergedSegments.length - 1].Transcript += ` ${segment.Transcript}`;
    } else {
      mergedSegments.push({ ...segment });
    }
  });
  return mergedSegments;
}
