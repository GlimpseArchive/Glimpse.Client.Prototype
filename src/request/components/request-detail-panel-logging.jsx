'use strict';

var messageProcessor = require('../util/request-message-processor');

var moment = require('moment');
var _ = require('lodash');
var React = require('react');

/**
 * Return the messages to be used by the view.
 */
var getMessages = (function() {
    var getList = messageProcessor.getTypeMessageList;
    
    var options = {
        'log-write': getList
    };
		
    return function(request) {
		return messageProcessor.getTypeStucture(request, options); 
    }
})();

/**
 * Return the CSS class name to use for the given message
 */
function getRowClass(message) {
    var rowClass = 'tab-logs-data-default';
    switch (message.level) {
        case 'Verbose':
        case 'Info':
            rowClass = 'tab-logs-data-default';
            break;
        case 'Critical':
        case 'Error':
            rowClass = 'tab-logs-data-error';
            break;
        case 'Warning':
            rowClass = 'tab-logs-data-warning';
            break;
        default:
            rowClass = 'tab-logs-data-default';
            break;
    }
    return rowClass;
}

/**
 * React class to display console messages
 */
var LogMessages = React.createClass({
    render: function() {
        return (
            <table className="table table-bordered table-striped tab-content-item">
                <thead>
                    <tr className="table-col-title-group">
                        <th width="5%"><span className="table-col-title">#</span></th>
                        <th width="10%"><span className="table-col-title">Level</span></th>
                        <th><span className="table-col-title">Message</span></th>
                        <th width="10%"><span className="table-col-title">From Start</span></th>
                        <th width="10%"><span className="table-col-title">Duration</span></th>
                    </tr>
                </thead>
                {this.props.logWriteMessages.map(function(message) {
                    var payload = message.payload;
                    var className = getRowClass(message);

                    return (
                        <tr className={className}>
                            <td>{payload.index}</td>
                            <td>{payload.level}</td>
                            <td>{payload.message}</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>);
                }) }
                <tfoot>
                    <tr className="table-body-padding table-col-title-group"><th colSpan="5"></th></tr>
                </tfoot>
            </table>
        );
    }
});

/**
 * React class to for the console log messages tab
 */
module.exports = React.createClass({
    getInitialState: function() {
        return { checkedState: false };
    },
    render: function() {
        var request = this.props.request;

        // get messages 
        var payload = getMessages(request);
        var logWriteMessages = payload.logWrite; 

        var content = null;
        if (!_.isEmpty(logWriteMessages)) {
            // intial processing of messages
            logWriteMessages = _.sortBy(logWriteMessages, 'ordinal');
            for (var i = 0; i < logWriteMessages.length; i++) {
                logWriteMessages[i].payload.index = i + 1;
            }            
            
            content = (
                <div className="tab-content">
                    <h3>{logWriteMessages.length} Logs</h3>
                    <LogMessages logWriteMessages={logWriteMessages} />
                </div>
            );
        }
        else {
            content = <div className="tab-section text-minor">Could not find any data.</div>;
        }

        return content;
    }
});


// TODO: Need to come up with a better self registration process
(function() {
    var requestTabController = require('../request-tab');

    requestTabController.registerTab({
        key: 'tab.logging',
        title: 'Trace',
        component: module.exports
    });
})();
