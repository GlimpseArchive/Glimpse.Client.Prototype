'use strict';

var messageProcessor = require('../util/request-message-processor');

var React = require('react');
var Timeago = require('lib/components/timeago');

module.exports = React.createClass({
    render: function () {
        var request = this.props.request;
        
        var payload = messageProcessor.getSummaryMessages(request);
        var user = payload.userIdentification || {};
        var beginRequest = payload.beginRequest || {};
        var endRequest = payload.endRequest || {};
        var view = payload.actionView || {};
        var action = payload.action || {};
        var abstract = {};

        return (
            <table className="table table-bordered">
                <tr>
                    <td width="90">{endRequest.responseDuration}ms</td>
                    <td colSpan="6">
                        {beginRequest.requestUrl} &nbsp; {beginRequest.requestMethod} &nbsp; {endRequest.responseStatusCode} ({endRequest.responseStatusTest}) - {endRequest.responseContentType}
                    </td>
                    <td><Timeago time={beginRequest.requestStartTime} /></td>
                </tr>
                <tr>
                    <td>{user.username}</td>
                    <td>{abstract.networkTime}ms</td>
                    <td>{abstract.serverTime}ms</td>
                    <td>{abstract.clientTime}ms</td>
                    <td>{action.actionControllerName}.{action.actionName}(...)</td>
                    <td>{action.actionDuration}ms</td>
                    <td>{view.viewDuration}ms</td>
                    <td>{abstract.queryTime}ms / {abstract.queryCount}</td>
                </tr>
            </table>
        );
    }
});
