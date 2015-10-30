'use strict';

var messageProcessor = require('../util/request-message-processor');

var _ = require('lodash');
var React = require('react');
var Highlight = require('react-highlight');
var classNames = require('classnames');

var getPayloads = (function() {
    var getItem = messageProcessor.getTypePayloadItem;
    
    var options = {
        'end-request': getItem,
        'begin-request': getItem,
        'action-content': getItem,
        'action-route': getItem,
        'after-action-invoked': getItem,
        'action-view-found': getItem,
        'after-action-view-invoked': getItem
    };
		
    return function(request) {
		return messageProcessor.getTypeStucture(request, options); 
    }
})();

var getMessages = (function() {
    var getItem = messageProcessor.getTypeMessageItem;
    var getList = messageProcessor.getTypeMessageList;
    
    var options = {
        'before-action-invoked': getItem,
        'after-action-invoked': getItem,
        'before-execute-command': getList,
        'after-execute-command': getList
    };
		
    return function(request) {
		return messageProcessor.getTypeStucture(request, options); 
    }
})();

module.exports = React.createClass({
    render: function () {
        var request = this.props.request;
        
        var payload = getPayloads(request);
        var beginRequestPayload = payload.beginRequest;
        var routePayload = payload.actionRoute;
        var contentPayload = payload.actionContent;
        var afterActionInvokedPayload = payload.afterActionInvoked;
        var actionViewFoundPayload = payload.actionViewFound;
        var afterActionViewInvokedPayload = payload.afterActionViewInvoked;
        
        var message = getMessages(request);
        var beforeActionInvokedMessage = message.beforeActionInvoked;
        var afterActionInvokedMessage = message.afterActionInvoked;
        var beforeExecuteCommandMessages = message.beforeExecuteCommand;
        var afterExecuteCommandMessages = message.afterExecuteCommand;
        
        var route = <div>No route found yet.</div>;
        if (routePayload) {
            var routePath = beginRequestPayload ? (<div><span>{beginRequestPayload.requestPath}</span><span>{beginRequestPayload.requestQueryString}</span></div>) : '';
        
            // process route
            route = (
                    <div className="flex">
                        <div className="tab-execution-header">
                            <div></div>
                            <div className="tab-execution-title col-2">Name</div>
                            <div className="tab-execution-title col-3">Path</div>
                            <div className="tab-execution-title col-4">Pattern</div>
                        </div>
                        <section className="tab-execution-item tab-execution-route"> 
                            <div className="tab-execution-title">Route</div>
                            <div className="col-2">{routePayload.routeName}</div>
                            <div className="col-3">{routePath}</div>
                            <div className="col-4">{routePayload.routePattern}</div>
                        </section>
                    </div>
                ); 
        }
        
        var action = <div>No action found yet.</div>;
        if (afterActionInvokedPayload) {
            // process content
            var content;
            if (contentPayload && contentPayload.binding) {
                content = _.map(contentPayload.binding, function(item, i) {
                    return <li key={i}>{item.type} {item.name} {item.value}</li>;
                });
                
                content = <ul className="paramater-list">{content}</ul>
            }
            
            // process action
            action = (
                    <div className="flex">
                        <div className="tab-execution-header">
                            <div></div>
                            <div className="tab-execution-title col-9">Controller/Action</div>
                        </div>
                        <section className="tab-execution-item tab-execution-action">
                            <div className="tab-execution-title">Action</div>
                            <div className="tab-execution-important col-8">
                                {afterActionInvokedPayload.actionControllerName}.{afterActionInvokedPayload.actionName}({content})
                            </div>
                            <div className="tab-execution-timing">{afterActionInvokedPayload.actionInvokedDuration}ms</div>
                        </section>
                    </div>
                ); 
        }
        
        var commands = '';
        if (beforeExecuteCommandMessages && afterExecuteCommandMessages && beforeActionInvokedMessage && afterActionInvokedMessage) {
            var startIndex = beforeActionInvokedMessage.ordinal;
            var endIndex = afterActionInvokedMessage.ordinal;
            
            beforeExecuteCommandMessages = beforeExecuteCommandMessages.sort(function(a, b) { return a.ordinal - b.ordinal; });
            afterExecuteCommandMessages = afterExecuteCommandMessages.sort(function(a, b) { return a.ordinal - b.ordinal; });
            
            var commandItems = [];
            for (var i = 0; i < beforeExecuteCommandMessages.length; i++) {
                var beforeCommand = beforeExecuteCommandMessages[i];
                var afterCommand = afterExecuteCommandMessages[i];
                
                if (beforeCommand.ordinal > startIndex && afterCommand.ordinal < endIndex) {
                    var duration = '--'
                    if (afterCommand.ordinal == beforeCommand.ordinal + 1) {
                        duration = afterCommand.payload.commandDuration;
                    }
                    
                    var commandItem = (
                        <div key={beforeCommand.id} className="tab-execution-command-item">
                            <div className="tab-execution-command-item-detail">
                                <div className="col-8"><span className="tab-execution-important">SQL:</span> {beforeCommand.payload.commandMethod} <span className="tab-execution-command-isAsync" title="Is Async">{(beforeCommand.payload.commandIsAsync ? 'async' : '')}</span></div>
                                <div className="tab-execution-timing col-2">{duration}ms</div>
                            </div>
                            <div className="tab-execution-command-text">
                                <Highlight className="sql">
                                    {beforeCommand.payload.commandText}
                                </Highlight>
                            </div>
                        </div>
                    );
                    commandItems.push(commandItem);
                }
            }
            
            // process action
            commands = (
                    <div className="flex">
                        <div className="tab-execution-header">
                            <div></div>
                            <div className="tab-execution-title col-9">Type/Method</div>
                        </div>
                        <section className="tab-execution-item tab-execution-command">
                            <div className="tab-execution-title">Data</div>
                            <div className="tab-execution-command-items col-9">{commandItems}</div>
                        </section>
                    </div>
                ); 
        }
        
        var view = <div>No view found yet.</div>;
        if (afterActionViewInvokedPayload) {
            var viewTitle = null;
            if (actionViewFoundPayload) { 
                viewTitle = <div><span className="tab-execution-important">{actionViewFoundPayload.viewName}</span> - <span>{actionViewFoundPayload.viewPath}</span></div>;
            }
        
            // process action
            view = (
                    <div className="flex">
                        <div className="tab-execution-header">
                            <div></div>
                            <div className="tab-execution-title col-9">Name/Path</div>
                        </div>
                        <section className="tab-execution-item tab-execution-view">
                            <div className="tab-execution-title">View</div>
                            <div className="tab-execution-important col-8">{viewTitle}</div>
                            <div className="tab-execution-timing">{afterActionViewInvokedPayload.viewDuration}ms</div>
                        </section>
                    </div>
                );
        }
        
        return (
            <div>
                <div className="application-sub-item-header">Execution on Server</div>
                {route}{action}{commands}{view}
            </div>
        );
    }
});


// TODO: Need to come up with a better self registration process
(function () {
    var requestTabController = require('../request-tab');

    requestTabController.registerTab({
        key: 'tab.execution',
        title: 'Execution',
        component: module.exports
    });
})();
