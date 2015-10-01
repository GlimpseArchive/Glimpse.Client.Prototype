'use strict';

var messageProcessor = require('../util/request-message-processor.js');

var React = require('react');
var Timeago = require('lib/components/timeago');

module.exports = React.createClass({
    render: function () {
        var request = this.props.request;
        
        var payload = messageProcessor.getSummaryMessages(request);
        var user = payload.userIdentification || {};
        var beginRequest = payload.beginRequestMessage || {};
        var endRequest = payload.endRequestMessage || {};
        var view = payload.actionViewMessage || { timing: {} };
        var action = payload.actionMessage || { timing: {} };
        var abstract = {};

        return (
            <table className="table table-bordered">
                <tr>
                    <td width="90">{request.duration}ms</td>
                    <td colSpan="6">
                        {beginRequest.url} &nbsp; {endRequest.method} &nbsp; {endRequest.statusCode} ({endRequest.statusText}) - {endRequest.contentType}
                    </td>
                    <td><Timeago time={request.dateTime} /></td>
                </tr>
                <tr>
                    <td>{user.username}</td>
                    <td>{abstract.networkTime}ms</td>
                    <td>{abstract.serverTime}ms</td>
                    <td>{abstract.clientTime}ms</td>
                    <td>{action.controllerName}.{action.actionName}(...)</td>
                    <td>{action.timing.elapsed}ms</td>
                    <td>{view.timing.elapsed}ms</td>
                    <td>{abstract.queryTime}ms / {abstract.queryCount}</td>
                </tr>
            </table>
        );
    }
});
