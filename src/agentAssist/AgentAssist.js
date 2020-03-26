// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import AWS from 'aws-sdk';
import { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

import { mergeAndComprehendTranscript } from '../utils/transcript';
import awsExports from '../aws-exports';
import '../styles/AgentAssist.css';

const defaultRegion = awsExports.aws_project_region;
AWS.config.update({
  region: defaultRegion,
});

const readTranscript = `
query listTranscriptSegments {
    listTranscriptSegments {
        items {
            CallId
                StartTime
                Speaker
                EndTime
                Transcript
                LoggedOn
        }
    }
}
`;

const anncTranscript = `subscription {
    onAnnounceCreateTranscriptSegment {
        CallId
            StartTime
            Speaker
            EndTime
            Transcript
            LoggedOn
    }
}
`;

class AgentAssist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transcript: [],
    };
  }

  async componentDidMount() {
    const transcript = await API.graphql(graphqlOperation(readTranscript));
    this.setState({
      transcript: transcript.data.listTranscriptSegments.items,
    });

    const observable = await API.graphql(graphqlOperation(anncTranscript));
    const addSegmentToState = segment => {
      this.setState(state => {
        const updatedTranscript = state.transcript.slice();
        updatedTranscript.push(segment);
        return {
          transcript: updatedTranscript,
        };
      });
    };

    const updateTranscript = data => {
      const segment = data.value.data.onAnnounceCreateTranscriptSegment;
      addSegmentToState(segment);
      return;
    };

    observable.subscribe({
      next: updateTranscript,
      complete: console.log,
      error: console.error,
    });
  }

  shouldMergeTranscript() {
    return this.props.value === this.props.index;
  }

  render() {
    let data = [];
    if (this.shouldMergeTranscript()) {
      const latestCall = this.state.transcript.reduce(
        (acc, curr) => (acc !== null && acc.LoggedOn > curr.LoggedOn ? acc : curr),
        null
      );
      const currentCallId = latestCall === null ? null : latestCall.CallId;
      data = [].concat(
        this.state.transcript.filter(e => e.CallId === currentCallId && e.EndTime !== null)
      );
      data = mergeAndComprehendTranscript(data).map((item, i) => (
        <tr key={i}>
          <td>{item.StartTime.toFixed(3)}</td>
          <td>{item.Speaker && item.Speaker === 'spk_0' ? 'agent' : 'caller'}</td>
          <td className={item.SentimentClass ? item.SentimentClass : 's-none'}>
            {item.Sentiment ? item.Sentiment : ''}
          </td>
          <td>
            {item.Action && item.Action === 'ClientSnapshot' ? (
              <a href="#modal2" className="action">
                Client Snapshot
              </a>
            ) : (
              ''
            )}
          </td>
          <td className="transcript-note">{item.Transcript}</td>
        </tr>
      ));
    }
    return (
      <div className="AssistAgent" hidden={this.props.value !== this.props.index}>
        <table id="ttlist" className="transcript">
          <thead className="transcript">
            <tr>
              <th>Start</th>
              <th>Speaker</th>
              <th style={{ width: '3em' }}>&plusmn;</th>
              <th>Action</th>
              <th style={{ width: '60%' }}>
                Transcript
                <a
                  href="#a"
                  onClick={e => {
                    this.setState({ transcript: [] });
                    e.preventDefault();
                  }}
                  title="Clear transcript"
                >
                  &empty;
                </a>
              </th>
            </tr>
          </thead>
          <tbody>{data}</tbody>
        </table>
      </div>
    );
  }
}

export default withAuthenticator(AgentAssist, false);
