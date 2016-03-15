'use strict';

var messageProcessor = require('../util/request-message-processor');

var moment = require('moment');
var _ = require('lodash');
var React = require('react');

/**
 * Return the log-write messages for the current request.
 */
var getPayloads = (function() {
    var getItem = messageProcessor.getTypePayloadList;

    var options = {
        'log-write': getItem,
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
            <div>
                <table>
                    <tr className='request-table-header'>
                        <td width="5%">#</td>
                        <td width="10%">Event</td>
                        <td width="12%">Date</td>
                        <td width="13%">Time</td>
                        <td width="60%">Description</td>
                    </tr>
                    {this.props.logWriteMessages.map(function(message) {
                        var dateString = message.parsedStartTime.format('MMM D, YYYY');
                        var timeString = message.parsedStartTime.format('HH:mm:ss:SS Z');
                        var className = getRowClass(message);

                        return (
                            <tr className={className}>
                                <td>{message.messageNumber}</td>
                                <td>{message.level}</td>
                                <td>{dateString}</td>
                                <td>{timeString}</td>
                                <td>{message.message}</td>
                            </tr>);
                    }) }
                </table>
            </div>
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

        // get payloads 
        var payload = getPayloads(request);
        var logWriteMessages = payload.logWrite;

        if (!logWriteMessages || logWriteMessages.length <= 0) {
            content = <div className="tab-section text-minor">Could not find any data.</div>;
        }
        else {
            // add a parsed moment to each message
            for (var i = 0; i < logWriteMessages.length; i++) {
                logWriteMessages[i].parsedStartTime = moment(logWriteMessages[i].startTime);
            }

            // sort messages descending by startTime
            logWriteMessages.sort(function(a, b) {
                if (a.parsedStartTime.isAfter(b.parsedStartTime)) {
                    return -1;
                }
                else if (a.parsedStartTime.isBefore(b.parsedStartTime)) {
                    return 1;
                }
                else {
                    return 0;
                }
            });

            // add ordinal numbers to the log messages
            for (var i = 0; i < logWriteMessages.length; i++) {
                logWriteMessages[i].messageNumber = i + 1;
            }

            var content = null;
            if (logWriteMessages && logWriteMessages.length > 0) {
                content = (
                    <div>
                        <div className="flex flex-row flex-inherit tab-section-header">
                            <span className="request-title">Server Side</span><nbsp/>
                            <span className="request-title-count">({logWriteMessages.length}) </span>
                        </div>
                        <LogMessages logWriteMessages={logWriteMessages} />
                    </div>
                );
            }
        }

        return content;
    }
});


// TODO: Need to come up with a better self registration process
(function() {
    var requestTabController = require('../request-tab');

    requestTabController.registerTab({
        key: 'tab.logging',
        title: 'Events',
        component: module.exports
    });
})();
