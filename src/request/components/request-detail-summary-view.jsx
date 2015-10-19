'use strict';

var glimpse = require('glimpse');
var messageProcessor = require('../util/request-message-processor');
var timeOrEmpty = glimpse.util.timeOrEmpty;

var React = require('react');
var Timeago = require('lib/components/timeago');

var timeOrEmpty = function(value) {
    if (value !== null && value !== undefined) {
        return <span>{value}<span className="request-summary-data-value-accent">ms</span></span>;
    }
    
    return <span className="request-summary-data-value-soft">--</span>;
};
var actionOrEmpty = function(controller, action) {
    if (controller && action) {
        return <span>{controller}<span className="request-summary-data-value-accent">.</span>{action}<span className="request-summary-data-value-accent">(...)</span></span>
    }
    
    return <span className="request-summary-data-value-soft">--</span>;
};
var commandOrEmpty = function(commands) {
    if (commands.length > 0) {
        var queryCount = 0;
        var queryDuration = 0;
        _.forEach(commands, function(command) {
            queryCount++;
            queryDuration += command.commandDuration;
        });
        
        return <span>{Math.round(queryDuration)}<span className="request-summary-data-value-accent">ms / </span>{queryCount}</span>;
    }
        
    return <span className="request-summary-data-value-soft">--</span>;
};
var contextTypeOrEmpty = function(contentCategory) {
    return contentCategory ? _.keys(contentCategory).join(', ') : '';
};

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
                <div className="request-summary-data-row-request request-summary-data-value-sub">
                    <div className="request-summary-data-col-8">
                        <div className="request-summary-data-value-primary">{beginRequest.requestPath}{beginRequest.requestQueryString}</div>
                        <div className="request-summary-data-row-items request-summary-data-value-soft">
                            <span>{beginRequest.requestMethod}</span>
                            <span title={endRequest.responseStatusText}>{endRequest.responseStatusCode}</span>
                            <span title={endRequest.responseContentType}>{contextTypeOrEmpty(endRequest.responseContentCategory)}</span>
                        </div>
                    </div>
                    <div className="request-summary-data-row-metadata request-summary-data-col-2">
                        {userIdentification.username} &nbsp; - &nbsp; <Timeago time={beginRequest.requestStartTime} />
                    </div>
                </div>
                <div className="request-summary-data-row-title request-summary-data-title">
                    <div>Request</div>
                    <div>Server</div>
                    <div>Client</div>
                    <div className="request-summary-data-col-2">Network</div>
                    <div>Action</div>
                    <div>View</div>
                    <div className="request-summary-data-col-4">Controller/Action</div>
                    <div>Query/Count</div>
                </div>
                <div className="request-summary-data-row-details">
                    <div className="request-summary-data-value-primary">{timeOrEmpty(endRequest.responseDuration)}</div>
                    <div>{timeOrEmpty(abstract.serverTime)}</div>
                    <div>{timeOrEmpty(abstract.clientTime)}</div>
                    <div className="request-summary-data-col-2">{timeOrEmpty(abstract.networkTime)}</div>
                    <div>{timeOrEmpty(afterActionInvoked.actionInvokedDuration)}</div>
                    <div>{timeOrEmpty(afterActionViewInvoked.viewDuration)}</div>
                    <div className="request-summary-data-value-primary request-summary-data-col-4">{actionOrEmpty(afterActionInvoked.actionControllerName, afterActionInvoked.actionName)}</div>
                    <div>{commandOrEmpty(afterExecuteCommand)}</div>
                </div>
            </div>
        );
    }
});
