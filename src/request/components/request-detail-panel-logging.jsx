'use strict';

var messageProcessor = require('../util/request-message-processor');

var moment = require('moment');
var _ = require('lodash');
var React = require('react');
var Icon = require('react-fa');

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
        case 'verbose':
        case 'information':
            rowClass = 'tab-logs-data-default';
            break;
        case 'critical':
        case 'error':
            rowClass = 'tab-logs-data-error';
            break;
        case 'warning':
            rowClass = 'tab-logs-data-warning';
            break;
        default:
            rowClass = 'tab-logs-data-default';
            break;
    }
    return rowClass;
}

function getDisplayText(level) {
    return _.startCase(level);
}

function getIconName(level) {
    switch (level) {
        case 'critical':
        case 'error':
            return 'times-circle';

        case 'warning':
            return 'exclamation-triangle';

        case 'verbose':
        case 'information':
        default:
            return '';
    }
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
                        <th width="15%"><span className="table-col-title"><Icon fixedWidth="true" /> Level</span></th>
                        <th><span className="table-col-title">Message</span></th>
                        <th width="15%"><span className="table-col-title">From Start</span></th>
                        <th width="15%"><span className="table-col-title">Duration</span></th>
                    </tr>
                </thead>
                {this.props.logWriteMessages.map(function(message) {
                    var payload = message.payload;
                    var className = getRowClass(payload);

                    return (
                        <tr className={className}>
                            <td>{payload.index}</td>
                            <td><Icon name={getIconName(payload.level)} fixedWidth="true" /> {getDisplayText(payload.level)}</td>
                            <td>{payload.message}</td>
                            <td>{message.context.offset ? message.context.offset + ' ms' : '-'}</td>
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
                var logWriteMessage = logWriteMessages[i];
                logWriteMessage.payload.index = i + 1;
                logWriteMessage.payload.level = logWriteMessage.payload.level.toLowerCase();
            }            
            
            content = (
                <div className="tab-content">
                    <h3>{logWriteMessages.length + ((logWriteMessages.length === 1) ? ' Message' : ' Messages')}</h3>
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
