'use strict';

var messageProcessor = require('../util/request-message-processor');

var React = require('react');
var Timeago = require('lib/components/timeago');

module.exports = React.createClass({
    render: function () {
        var request = this.props.request;
        
        var payload = messageProcessor.getSummaryMessages(request);
        var userIdentification = payload.userIdentification || {};  // TODO: shouldn't need to do this, think of better way
        var beginRequest = payload.beginRequest || {};
        var endRequest = payload.endRequest || {};
        var afterActionViewInvoked = payload.afterActionViewInvoked || {};
        var afterActionInvoked = payload.afterActionInvoked || {};
        var afterExecuteCommand = payload.afterExecuteCommand || [];
        var abstract = {};
        
        return (
            <table className="table table-bordered">
                <tr>
                    <td width="90">{endRequest.responseDuration}ms</td>
                    <td colSpan="6">
                        {beginRequest.requestUrl} &nbsp; {beginRequest.requestMethod} &nbsp; {endRequest.responseStatusCode} ({endRequest.responseStatusText}) - {endRequest.responseContentType}
                    </td>
                    <td><Timeago time={beginRequest.requestStartTime} /></td>
                </tr>
                <tr>
                    <td>{userIdentification.username}</td>
                    <td>{abstract.networkTime}ms</td>
                    <td>{abstract.serverTime}ms</td>
                    <td>{abstract.clientTime}ms</td>
                    <td>{afterActionInvoked.actionControllerName}.{afterActionInvoked.actionName}(...)</td>
                    <td>{afterActionInvoked.actionInvokedDuration}ms</td>
                    <td>{afterActionViewInvoked.viewDuration}ms</td>
                    <td>{abstract.queryTime}ms / {abstract.queryCount}</td>
                </tr>
            </table>
        );
    }
});
