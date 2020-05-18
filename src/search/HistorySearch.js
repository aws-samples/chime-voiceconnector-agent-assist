// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import TextField from '@material-ui/core/TextField';

import StreamingRecord from './StreamingRecord';
import { queryCall } from '../utils/elasticsearch';
import '../styles/HistorySearch.css';

class HistorySearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      metadata: [],
      currInput: '',
    };
  }

  componentDidMount() {
    queryCall(this.props.accountId).then(data => {
      this.setState({ currInput: this.props.accountId, metadata: data });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const input = this.state.currInput;
    if (this.state.currInput !== prevState.currInput) {
      queryCall(this.state.currInput).then(data => {
        // If current input remains unchanged after callback, then set the state.
        if (input === this.state.currInput) {
          this.setState({ metadata: [] });
          this.setState({ metadata: data });
        }
      });
    }
  }

  handleSearch = event => {
    this.setState({ currInput: event.target.value });
  };

  render() {
    return (
      <div className="HistorySearch" hidden={this.props.value !== this.props.index}>
        <div className="search-text-field">
          <form noValidate autoComlete="off">
            <TextField
              variant="outlined"
              label="Search"
              id="searchField"
              fullWidth
              onChange={this.handleSearch}
              helperText="Keyword includes metadata(account id, voice connector id, phone number, header, timestamp, etc) or Transcription"
            />
          </form>
        </div>
        <div>
          {this.state.metadata.map((r, i) => {
            return <StreamingRecord key={i} metadata={r} keyword={this.state.currInput} />;
          })}
        </div>
      </div>
    );
  }
}

export default withAuthenticator(HistorySearch, false);
