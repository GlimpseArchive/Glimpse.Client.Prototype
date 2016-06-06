import { ILoggingProps, Logging } from '../components/RequestDetailPanelLogging';
import { getFilteredMessages, getTotalMessageCount  } from '../selectors/RequestDetailLoggingSelectors';

import * as React from 'react';
import { connect } from 'react-redux';

// Which part of the Redux global state does our component want to receive as props?
function mapStateToProps(state) {
  return {
    filteredMessages: getFilteredMessages(state),
    totalMessageCount: getTotalMessageCount(state)
  };
}

// Which action creators does it want to receive by props?
function mapDispatchToProps(dispatch) {
  return {
  };
}

export = connect(
  mapStateToProps,
  mapDispatchToProps
)(Logging);
