'use strict';

var glimpse = require('glimpse');
var messageProcessor = require('../util/request-message-processor');

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
        var user = payload.userIdentification || {};  // TODO: shouldn't need to do this, think of better way
        var beginRequest = payload.beginRequest || {};
        var endRequest = payload.endRequest || {};
        var view = payload.actionView || {};
        var action = payload.action || {};
        var abstract = {};
        
        return (
            <div className={containerClass} onClick={this.onSelect}>
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
            </div>
        );
    },
    onSelect: function () {
        glimpse.emit('shell.request.summary.selected', { requestId: this.props.request.id });
    }
});
