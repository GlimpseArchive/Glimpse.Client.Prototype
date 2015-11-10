'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');
var messageProcessor = require('../util/request-message-processor');

var React = require('react');
var Timeago = require('lib/components/timeago');
var classNames = require('classnames');

var timeOrEmpty = function(value) {
    if (value !== null && value !== undefined) {
        return <span>{Math.round(value)} <span className="text-minor text-accent">ms</span></span>;
    }
    
    return <span className="text-minor">--</span>;
};
var actionOrEmpty = function(controller, action) {
    if (controller && action) {
        return <div className="truncate">{controller}<span className="text-minor text-accent">.</span>{action}<span className="text-minor text-accent">(...)</span></div>
    }
    
    return <span className="text-minor">--</span>;
};
var actionOrEmptyTitle = function(controller, action) {
    return controller && action ? controller + '.' + action + '(...)' : '';
};
var commandOrEmpty = function(commands) {
    if (commands.length > 0) {
        var queryCount = 0;
        var queryDuration = 0;
        _.forEach(commands, function(command) {
            queryCount++;
            queryDuration += command.commandDuration;
        });
        
        return <span>{Math.round(queryDuration)} <span className="text-minor text-accent">ms &nbsp;/&nbsp; </span>{queryCount}</span>;
    }
        
    return <span className="text-minor">--</span>;
};
var contextTypeOrEmpty = function(contentCategory) {
    return contentCategory ? _.keys(contentCategory).join(', ') : '';
};
var requestTime = function(endRequest, browserNavigationTiming) {
    var total = ''
    if (browserNavigationTiming && browserNavigationTiming.serverTime) {
        total = browserNavigationTiming.serverTime + browserNavigationTiming.browserTime + browserNavigationTiming.networkTime;
    }
    else if (endRequest && endRequest.responseDuration) {
        total = endRequest.responseDuration;
    }
    
    return timeOrEmpty(total);
};

module.exports = React.createClass({
    render: function () {
        var request = this.props.request;
        
        var containerClass = classNames({
            'request-summary-group-item': true,
            'request-summary-group-item-selected request-summary-group-item-focus': request._selected
        });
        
        var payload = messageProcessor.getSummaryMessages(request);
        var userIdentification = payload.userIdentification || {};  // TODO: shouldn't need to do this, think of better way
        var beginRequest = payload.beginRequest || {};
        var endRequest = payload.endRequest || {};
        var afterActionViewInvoked = payload.afterActionViewInvoked || {};
        var afterActionInvoked = payload.afterActionInvoked || {};
        var afterExecuteCommand = payload.afterExecuteCommand || [];
        var browserNavigationTiming = payload.browserNavigationTiming || {};

        return (
            <div className={containerClass} onClick={this.onSelect}>
                <div className="flex flex-row flex-base request-summary-title-section">
                    <div className="flex flex-row flex-base col-8">
                        <div className="text-focus">{beginRequest.requestPath}{beginRequest.requestQueryString}</div>
                        <div className="text-minor request-summary-title-detail">
                            <span>{beginRequest.requestMethod}</span>
                            <span title={endRequest.responseStatusText}>{endRequest.responseStatusCode}</span>
                            <span title={endRequest.responseContentType}>{contextTypeOrEmpty(endRequest.responseContentCategory)}</span>
                        </div>
                    </div>
                    <div className="col-2 text-minor request-summary-metadata">
                        {userIdentification.username} &nbsp; - &nbsp; <Timeago time={beginRequest.requestStartTime} />
                    </div>
                </div>
                <div className="flex flex-row flex-inherit text-accent-small text-minor">
                    <div className="col-3">Request</div>
                    <div className="col-2">Server</div>
                    <div className="col-2">Client</div>
                    <div className="col-4">Network</div>
                    <div className="col-2">Action</div>
                    <div className="col-2">View</div>
                    <div className="col-7">Controller/Action</div>
                    <div className="col-3">Query/Count</div>
                </div>
                <div className="flex flex-row flex-inherit flex-base request-summary-facets">
                    <div className="col-3 text-focus">{requestTime(endRequest, browserNavigationTiming)}</div>
                    <div className="col-2">{timeOrEmpty(browserNavigationTiming.serverTime)}</div>
                    <div className="col-2">{timeOrEmpty(browserNavigationTiming.browserTime)}</div>
                    <div className="col-4">{timeOrEmpty(browserNavigationTiming.networkTime)}</div>
                    <div className="col-2">{timeOrEmpty(afterActionInvoked.actionInvokedDuration)}</div>
                    <div className="col-2">{timeOrEmpty(afterActionViewInvoked.viewDuration)}</div>
                    <div className="col-7 text-focus truncate-outer" title={actionOrEmptyTitle(afterActionInvoked.actionControllerName, afterActionInvoked.actionName)}>{actionOrEmpty(afterActionInvoked.actionControllerName, afterActionInvoked.actionName)}</div>
                    <div className="col-3">{commandOrEmpty(afterExecuteCommand)}</div>
                </div>
            </div>
        );
    },
    onSelect: function () {
        glimpse.emit('shell.request.summary.selected', { requestId: this.props.request.id });
    }
});
