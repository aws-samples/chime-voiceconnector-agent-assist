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
query listTranscriptSegments($nextToken: String = "") {
    listTranscriptSegments(nextToken: $nextToken) {
        items {
            TransactionId
                StartTime
                Speaker
                EndTime
                Transcript
                LoggedOn
        },
        nextToken
    }
}
`;

const anncTranscript = `subscription {
    onAnnounceCreateTranscriptSegment {
        TransactionId
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
    const transcript = await this.readTranscriptPaginationAndUpdate();
    this.setState({ transcript: transcript });

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

  async readTranscriptPaginationAndUpdate() {
    let transcript = [];
    const firstPage = await API.graphql(graphqlOperation(readTranscript));
    let nextToken = firstPage.data.listTranscriptSegments.nextToken;

    transcript = transcript.concat(firstPage.data.listTranscriptSegments.items);

    while (nextToken !== null) {
      const nextPage = await API.graphql(
        graphqlOperation(readTranscript, { nextToken: nextToken })
      );
      nextToken = nextPage.data.listTranscriptSegments.nextToken;
      transcript = transcript.concat(nextPage.data.listTranscriptSegments.items);
    }

    return transcript;
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
      const currentTransactionId = latestCall === null ? null : latestCall.TransactionId;
      data = [].concat(
        this.state.transcript.filter(
          e => e.TransactionId === currentTransactionId && e.EndTime !== null
        )
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
        <div id="modal1" className="overlay">
          <a className="cancel" href="#a" title="Close modal">
            {' '}
          </a>
          <div className="modal">
            <h1>Connection Doctor</h1>
            <div className="content">
              <table>
                <tbody>
                  <tr>
                    <td>PNR: </td>
                    <td>CJK1Z3</td>
                  </tr>
                  <tr>
                    <td>PAX: </td>
                    <td>Johnson/Jonas</td>
                  </tr>
                  <tr>
                    <td>Itinerary: </td>
                    <td>
                      LGA/MIA NA 1211 1219/1531 (now 1600/1912)
                      <br />
                      CONN 134 min (now *MISSED*)
                      <br />
                      MIA/SJU NA 2561 1745/2026
                    </td>
                  </tr>
                  <tr>
                    <td>Remediation</td>
                    <td>
                      <span className="opt" onClick={() => console.log('Internal')}>
                        Internal (0)
                      </span>
                      <span className="opt" onClick={() => console.log('Codeshare')}>
                        Codeshare (2)
                      </span>
                      <span className="opt" onClick={() => console.log('Other')}>
                        Other (10+)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="modal2" className="overlay">
          <a className="cancel" href="#a" title="Close modal">
            {' '}
          </a>
          <div className="modal">
            <h1>Client Snapshot</h1>
            <div className="content">
              <table>
                <tbody>
                  <tr>
                    <td>Account: </td>
                    <td>PC1234</td>
                  </tr>
                  <tr>
                    <td>User: </td>
                    <td>joe@joey.com</td>
                  </tr>
                  <tr>
                    <td>Software: </td>
                    <td>PowerChart 1.35 (upgraded 12-Feb-2020 3:02 PM UTC)</td>
                  </tr>
                  <tr>
                    <td>Remediation</td>
                    <td>
                      <span className="opt" onClick={() => console.log('ReleaseNotes')}>
                        Release notes
                      </span>
                      <span className="opt" onClick={() => console.log('Manager')}>
                        Mgr. Escalation
                      </span>
                      <span className="opt" onClick={() => console.log('Credits')}>
                        Credits
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withAuthenticator(AgentAssist, false);
