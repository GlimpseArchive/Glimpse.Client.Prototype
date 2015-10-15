'use strict';

var glimpse = require('glimpse');
var messageProcessor = require('../util/request-message-processor');
var timeOrEmpty = glimpse.util.timeOrEmpty;

var React = require('react');
var Timeago = require('lib/components/timeago');

var timeOrEmpty = function(value, className) {
    if (value !== null && value !== undefined) {
        return <div className={className}>{value}<span className="request-summary-data-value-accent">ms</span></div>;
    }
    
    return <div className={className}><span className="request-summary-data-value-soft">--</span></div>;
}
var actionOrEmpty = function(controller, action) {
    if (controller && action) {
        return <div className="request-summary-data-value-primary request-summary-data-col-3">{controller}<span className="request-summary-data-value-accent">.</span>{action}<span className="request-summary-data-value-accent">(...)</span></div>
    }
    
    return <div className="request-summary-data-value-primary request-summary-data-col-3 request-summary-data-value-soft">--</div>;
}
var commandOrEmpty = function(commands) {
    if (commands.length > 0) {
        var queryCount = 0;
        var queryDuration = 0;
        _.forEach(commands, function(command) {
            queryCount++;
            queryDuration += command.commandDuration;
        });
        
        return <div>{Math.round(queryDuration)}<span className="request-summary-data-value-accent">ms / </span>{queryCount}</div>;
    }
        
    return <div className="request-summary-data-value-soft">--</div>;
}

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
        var abstract = { networkTime: 2, serverTime: 35, clientTime: 42 }; // TODO: temp until we get values 
        
        return (
            <div className="request-summary-data-holder">
                <div className="request-summary-data-holder">
                    <div className="request-summary-data-row-top request-summary-data-value-sub">
                        <div className="request-summary-data-value-primary">{beginRequest.requestPath}{beginRequest.requestQueryString}</div>
                        <div className="request-summary-data-row-items request-summary-data-value-soft">
                            <span>{beginRequest.requestMethod}</span>
                            <span>{endRequest.responseStatusCode}</span>
                            <span>{endRequest.responseStatusText}</span>
                        </div>
                    </div>
                    <div className="request-summary-data-row-main">
                        {timeOrEmpty(endRequest.responseDuration, 'request-summary-data-value-primary')}
                        {timeOrEmpty(abstract.networkTime)}
                        {timeOrEmpty(abstract.serverTime)}
                        {timeOrEmpty(abstract.clientTime)}
                        {actionOrEmpty(afterActionInvoked.actionControllerName, afterActionInvoked.actionName)}
                        {timeOrEmpty(afterActionInvoked.actionInvokedDuration)}
                        {timeOrEmpty(afterActionViewInvoked.viewDuration)}
                        {commandOrEmpty(afterExecuteCommand)}
                    </div>
                    <div className="request-summary-data-row-bottom request-summary-data-title">
                        <div>Request</div>
                        <div>Network</div>
                        <div>Server</div>
                        <div>Client</div>
                        <div className="request-summary-data-col-3">Controller/Action</div>
                        <div>Action</div>
                        <div>View</div>
                        <div>Query/Count</div>
                    </div>
                </div>
            </div>
        );
    }
});
