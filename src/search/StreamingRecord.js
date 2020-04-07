// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import PropTypes from 'prop-types';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Avatar from '@material-ui/core/Avatar';
import CallReceivedIcon from '@material-ui/icons/CallReceived';
import CallMadeIcon from '@material-ui/icons/CallMade';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import moment from 'moment/moment';

import {
  getSignedUrl,
  retrieveBucketAndKey,
  retrieveTranscriptForTransactionId,
} from '../utils/elasticsearch';
import { mergeTranscript } from '../utils/transcript';
import { getMergedAudioURL } from '../utils/audio';
import '../styles/StreamingRecord.css';

class StreamingRecord extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      metadata: this.props.metadata,
      transcript: [],
      requireMerged: false,
      keyword: this.props.keyword,
    };
  }

  updateTranscript() {
    retrieveTranscriptForTransactionId(this.state.metadata.TransactionId).then(segments => {
      this.setState({ transcript: mergeTranscript(segments) });
    });
  }

  componentDidMount() {
    this.updateTranscript();
  }

  onExpand = (event, expanded) => {
    if (
      expanded === true &&
      (this.state.agentLegAudioUrl === undefined || this.state.callerLegAudioUrl === undefined)
    ) {
      retrieveBucketAndKey(this.state.metadata.TransactionId).then(pairs => {
        if (pairs.length === 0) {
          return;
        }

        const urlPromise = pairs.map(pair => {
          if (pair.Bucket === undefined || pair.Key === undefined || pair.Time === undefined) {
            return undefined;
          }

          return getSignedUrl(pair.Bucket, pair.Key);
        });

        Promise.all(urlPromise).then(urls => {
          this.setState({ callerLegAudioUrl: urls[0], agentLegAudioUrl: urls[1] });
        });

        if (this.state.mergedAudioUrl === undefined) {
          const bucket = pairs[0].Bucket,
            oneAudioObject = pairs[0],
            otherAudioObject = pairs[1];
          getMergedAudioURL(
            bucket,
            oneAudioObject,
            otherAudioObject,
            this.state.metadata.TransactionId
          ).then(url => {
            this.setState({ mergedAudioUrl: url });
          });
        }
      });
    }
  };

  onSwitchChange = event => {
    this.setState({ requireMerged: event.target.checked });
  };

  render() {
    const getSubContent = () => {
      if (this.state.transcript === undefined) {
        return '(waiting for transcript retrivement...)';
      } else if (this.state.transcript.length === 0) {
        return 'Cannot translate the streaming audio';
      } else {
        return this.state.transcript[0].Transcript + ' (click for more)';
      }
    };

    const highlightTranscript = (speaker, lines, keywords) => {
      const style = {
        backgroundColor: 'wheat',
      };
      return (
        <Typography>
          {' '}
          {speaker === 'spk_0' ? 'Caller: ' : 'Agent: '}
          {lines.split(' ').map(word => {
            const match = keywords
              .split(' ')
              .map(keyword => {
                if (keyword === '') {
                  return false;
                }

                // keyword only allows number, letter(lowercase and upper).
                const matchedKeyword = new RegExp("[0-9a-zA-Z,?.' ]+", 'i').exec(keyword)[0];

                // i.e. keyword is apple, 'apple.', 'apple', 'Apple' are allowed.
                const regex = new RegExp(matchedKeyword + '[,.?]?$', 'i');
                if (regex.test(word)) {
                  return true;
                }
                return false;
              })
              .reduce((e1, e2) => e1 || e2);

            if (match === true) {
              return <span style={style}>{word} </span>;
            } else {
              return word + ' ';
            }
          })}
        </Typography>
      );
    };

    const getDetail = () => {
      if (this.state.transcript === undefined) {
        return <Typography> (Retrieving transcripts ...) </Typography>;
      } else if (this.state.transcript.length === 0) {
        return (
          <div className="transcript">
            <Typography>Transcript is not applicable</Typography>
          </div>
        );
      } else {
        return (
          <div className="transcript">
            {this.state.transcript.map(tr => {
              return highlightTranscript(tr.Speaker, tr.Transcript, this.state.keyword);
            })}
          </div>
        );
      }
    };

    const getDateAndDuration = () => {
      const formatDuration = diffSeconds => {
        const duration = moment.duration(diffSeconds, 'seconds');
        let formatString = 'H[h] m[m] s[s]';
        if (duration.asSeconds() < 3600) {
          formatString = 'm[m] s[s]';
        }
        return moment.utc(duration.asMilliseconds()).format(formatString);
      };

      if (this.state.metadata.EndTimeEpochSeconds === undefined) {
        return (
          <div>
            <Typography className="third-heading">In Call</Typography>
          </div>
        );
      }

      return (
        <div>
          <div>
            <Typography className="third-heading">
              {moment.unix(this.state.metadata.StartTimeEpochSeconds).fromNow()}
            </Typography>
          </div>
          <div>
            <Typography className="third-heading">
              {formatDuration(
                this.state.metadata.EndTimeEpochSeconds - this.state.metadata.StartTimeEpochSeconds
              )}
            </Typography>
          </div>
        </div>
      );
    };

    const getMergedSwitch = () => {
      return (
        <div>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={this.state.requireMerged}
                onChange={this.onSwitchChange}
              />
            }
            label="Merge audio?"
          />
        </div>
      );
    };

    const getAudio = () => {
      if (!this.state.requireMerged) {
        return (
          <div className="audio">
            <div className="caller-leg">
              <p>Caller leg</p>
              {this.state.callerLegAudioUrl !== undefined ? (
                <audio
                  controls
                  volume="0.1"
                  id="audio"
                  className="stream-audio"
                  src={this.state.callerLegAudioUrl}
                />
              ) : (
                <Typography> Caller streaming audio is not applicable</Typography>
              )}
            </div>
            <div className="agent-leg">
              <p>Agent leg</p>
              {this.state.agentLegAudioUrl !== undefined ? (
                <audio
                  controls
                  volume="0.1"
                  id="audio"
                  className="stream-audio"
                  src={this.state.agentLegAudioUrl}
                />
              ) : (
                <Typography> Agent streaming audio is not applicable</Typography>
              )}
            </div>
          </div>
        );
      } else {
        return (
          <div className="audio">
            <div className="merged-audio">
              <p>Merged Audio</p>
              {this.state.mergedAudioUrl !== undefined ? (
                <audio
                  controls
                  volume="0.1"
                  id="audio"
                  className="stream-audio"
                  src={this.state.mergedAudioUrl}
                />
              ) : (
                <Typography> Merged streaming audio is not applicable</Typography>
              )}
            </div>
          </div>
        );
      }
    };

    return (
      <div className="root">
        <ExpansionPanel onChange={this.onExpand}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <div className="avater-col">
              <Avatar>
                {this.state.metadata.Direction === 'Inbound' ? (
                  <CallReceivedIcon />
                ) : (
                  <CallMadeIcon />
                )}
              </Avatar>
            </div>
            <div className="main-col">
              <div className="number-header-row">
                <Typography className="number-header">
                  From: {this.state.metadata.SourcePhoneNumber}
                </Typography>
              </div>
              <div className="sub-content-row">
                <Typography className="sub-content">{getSubContent()}</Typography>
              </div>
            </div>
            <div className="right-col">{getDateAndDuration()}</div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <div className="panel-detail">
              {getDetail()}
              {getMergedSwitch()}
              {getAudio()}
            </div>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }
}

StreamingRecord.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default StreamingRecord;
