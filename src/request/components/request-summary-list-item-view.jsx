'use strict';

var _ = require('lodash');
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
            'request-summary-item-selected': request._selected
        });
        
        var payload = messageProcessor.getSummaryMessages(request);
        var userIdentification = payload.userIdentification || {};  // TODO: shouldn't need to do this, think of better way
        var beginRequest = payload.beginRequest || {};
        var endRequest = payload.endRequest || {};
        var afterActionViewInvoked = payload.afterActionViewInvoked || {};
        var afterActionInvoked = payload.afterActionInvoked || {};
        var afterExecuteCommand = payload.afterExecuteCommand || [];
        var abstract = { networkTime: 2, serverTime: 35, clientTime: 42 }; // TODO: temp until we get values 
        
        // should be pulled out into a different control
        var queryGroup = '--';
        if (afterExecuteCommand.length > 0) {
            var queryCount = 0;
            var queryDuration = 0;
            _.forEach(afterExecuteCommand, function(command) {
                queryCount++;
                queryDuration += command.commandDuration;
            });
            
            queryGroup = Math.round(queryDuration) + 'ms / ' + queryCount;
        }        
        
        return (
            <div className={containerClass} onClick={this.onSelect}>
                <div className="request-summary-data-holder">
                    <div className="request-summary-leadGroup">
                        <div>
                            <div className="request-summary-responseDuration">{timeOrEmpty(endRequest.responseDuration)}</div>
                            <div className="request-summary-duration-bar">
                                <div className="request-summary-duration-bar-network"></div>
                                <div className="request-summary-duration-bar-server"></div>
                                <div className="request-summary-duration-bar-client"></div>
                            </div>
                        </div>
                        <div className="request-summary-duration-items-outer">
                            <div className="request-summary-duration-items">
                                <div className="request-summary-networkTime">{timeOrEmpty(abstract.networkTime)}</div>
                                <div className="request-summary-serverTime">{timeOrEmpty(abstract.serverTime)}</div>
                                <div className="request-summary-clientTime">{timeOrEmpty(abstract.clientTime)}</div>
                            </div>
                        </div>
                        <div className="request-summary-requestStartTime"><Timeago time={beginRequest.requestStartTime} /></div>
                    </div>
                    <div className="request-summary-detailGroup">
                        <div className="request-summary-data-holder request-summary-detailMainGroup">
                            <div className="request-summary-requestMethod">{beginRequest.requestMethod}</div>
                            <div className="request-summary-requestUrl">{beginRequest.requestPath}<span className="request-summary-requestQueryString">{beginRequest.requestQueryString}</span></div>
                            <div className="request-summary-responseStatusCode">{endRequest.responseStatusCode}<span className="request-summary-responseStatusText">{endRequest.responseStatusText}</span></div>
                            <div className="request-summary-responseContentType">{endRequest.responseContentType}</div>
                        </div>
                        <div className="request-summary-data-holder request-summary-detailSubGroup">
                            <div className="request-summary-actionGroup">{afterActionInvoked.actionControllerName}.{afterActionInvoked.actionName}(...)</div>
                            <div className="request-summary-actionInvokedDuration">{timeOrEmpty(afterActionInvoked.actionInvokedDuration)}</div>
                            <div className="request-summary-viewDuration">{timeOrEmpty(afterActionViewInvoked.viewDuration)}</div>
                            <div className="request-summary-queryGroup">{queryGroup}</div>
                            <div className="request-summary-username">{userIdentification.username}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
    onSelect: function () {
        glimpse.emit('shell.request.summary.selected', { requestId: this.props.request.id });
    }
});
