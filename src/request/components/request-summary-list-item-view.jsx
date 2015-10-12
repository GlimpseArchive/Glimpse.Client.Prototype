'use strict';

var glimpse = require('glimpse');
var messageProcessor = require('../util/request-message-processor');
var timeOrEmpty = glimpse.util.timeOrEmpty;

var React = require('react');
var Timeago = require('lib/components/timeago');
var classNames = require('classnames');

module.exports = React.createClass({
    render: function () {
        var request = this.props.request;
        
        var containerClass = classNames({
            'request-summary-item-holder': true,
            'request-summary-shell-selected': request._selected
        });
        
        var payload = messageProcessor.getSummaryMessages(request);
        var userIdentification = payload.userIdentification || {};  // TODO: shouldn't need to do this, think of better way
        var beginRequest = payload.beginRequest || {};
        var endRequest = payload.endRequest || {};
        var afterActionViewInvoked = payload.afterActionViewInvoked || {};
        var afterActionInvoked = payload.afterActionInvoked || {};
        var afterExecuteCommand = payload.afterExecuteCommand || [];
        var abstract = {};
        
        return (
            <div className={containerClass} onClick={this.onSelect}>
                <table className="list-item">
                    <tr>
                        <td width="90">{timeOrEmpty(endRequest.responseDuration)}</td>
                        <td colSpan="6">
                            {beginRequest.requestUrl} &nbsp; {beginRequest.requestMethod} &nbsp; {endRequest.responseStatusCode} ({endRequest.responseStatusText}) - {endRequest.responseContentType}
                        </td>
                        <td><Timeago time={beginRequest.requestStartTime} /></td>
                    </tr>
                    <tr>
                        <td>{userIdentification.username}</td>
                        <td>{timeOrEmpty(abstract.networkTime)}</td>
                        <td>{timeOrEmpty(abstract.serverTime)}</td>
                        <td>{timeOrEmpty(abstract.clientTime)}</td>
                        <td>{afterActionInvoked.actionControllerName}.{afterActionInvoked.actionName}(...)</td>
                        <td>{timeOrEmpty(afterActionInvoked.actionInvokedDuration)}</td>
                        <td>{timeOrEmpty(afterActionViewInvoked.viewDuration)}</td>
                        <td>{abstract.queryTime}ms / {abstract.queryCount}</td>
                    </tr>
                </table>
            </div>
        );
    },
    onSelect: function () {
        glimpse.emit('shell.request.summary.selected', { requestId: this.props.request.id });
    }
});
