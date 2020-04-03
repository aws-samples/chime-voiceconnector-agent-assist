// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { getAWSAccountId } from '../utils/sts';
import '../styles/App.css';
import AgentAssist from '../agentAssist/AgentAssist';
import HistorySearch from '../search/HistorySearch';
import Amplify from 'aws-amplify';
import awsExports from '../aws-exports';

Amplify.configure(awsExports);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '0',
      accountId: '',
    };
  }

  handleChange = (event, newValue) => {
    this.setState({ value: newValue });
  };

  componentDidMount() {
    document.title = 'Chime Vx - Agent Assist';
    getAWSAccountId().then(id => {
      this.setState({ accountId: id.Account });
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Agent Assist (Chime Vx)</h1>
        </header>
        <br />
        <Tabs
          value={this.state.value}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="ActiveCall" value="0" />
          <Tab label="Search" value="1" />
        </Tabs>
        <AgentAssist value={this.state.value} index="0" />
        <HistorySearch accountId={this.state.accountId} value={this.state.value} index="1" />
      </div>
    );
  }
}

export default withAuthenticator(App, true);
