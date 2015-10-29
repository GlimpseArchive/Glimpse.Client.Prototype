'use strict';

var messageProcessor = require('../util/request-message-processor');

var _ = require('lodash');
var React = require('react');
var classNames = require('classnames');

var getMessages = (function() {
    var getItem = messageProcessor.getTypePayloadItem;
    var getList = messageProcessor.getTypePayloadList;
    
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
		return messageProcessor.getTypePayloads(request, options); 
    }
})();

module.exports = React.createClass({
    render: function () {
        var request = this.props.request;
        
        var payload = getMessages(request);
        var beginRequestData = payload.beginRequest;
        var routeData = payload.actionRoute;
        var contentData = payload.actionContent;
        var afterActionInvokedData = payload.afterActionInvoked;
        var actionViewFoundData = payload.actionViewFound;
        var afterActionViewInvokedData = payload.afterActionViewInvoked;
        
        var route = <div>No route found yet.</div>;
        if (routeData) {
            var routePath = beginRequestData ? (<div><span>{beginRequestData.path}</span><span>{beginRequestData.queryString}</span></div>) : '';
        
            // process route
            route = (
                    <section className="tab-execution-item tab-execution-route"> 
                        <div className="tab-execution-title">Route</div>
                        <div className="tab-execution-route-name tab-execution-important">{routeData.routeName}</div>
                        <div className="tab-execution-route-path">{routePath}</div>
                        <div className="tab-execution-route-pattern">{routeData.routePattern}</div>
                    </section>
                ); 
        }
        
        var action = <div>No action found yet.</div>;
        if (afterActionInvokedData) {
            // process content
            var content;
            if (contentData && contentData.binding) {
                content = _.map(contentData.binding, function(item, i) {
                    return <li key={i}>{item.type} {item.name} {item.value}</li>;
                });
                
                content = <ul className="paramater-list">{content}</ul>
            }
            
            // process action
            action = (
                    <section className="tab-execution-item tab-execution-action">
                        <div className="tab-execution-title">Action</div>
                        <div className="tab-execution-action-description tab-execution-important">
                            {afterActionInvokedData.actionControllerName}.{afterActionInvokedData.actionName}({content})
                        </div>
                        <div className="tab-execution-timing">{afterActionInvokedData.actionInvokedDuration}ms</div>
                    </section>
                ); 
        }
        
        var view = <div>No view found yet.</div>;
        if (afterActionViewInvokedData) {
            var viewTitle = null;
            if (actionViewFoundData) { 
                var viewTitleClass = classNames({
                    'tab-execution-important': true,
                    'tab-execution-view-found': actionViewFoundData.viewDidFind,
                    'tab-execution-view-notfound': !actionViewFoundData.viewDidFind
                });
                
                viewTitle = <div><span className={viewTitleClass}>{actionViewFoundData.viewName}</span> - <span>{actionViewFoundData.viewPath}</span></div>;
            }
        
            // process action
            view = (
                <section className="tab-execution-item tab-execution-view">
                    <div className="tab-execution-title">View</div>
                    <div className="tab-execution-view-path">{viewTitle}</div>
                    <div className="tab-execution-timing">{afterActionViewInvokedData.viewDuration}ms</div>
                </section>
            )
        }
        
        return (
            <div>
                <div className="application-sub-item-header">Execution on Server</div>
                {route}{action}{view}
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
