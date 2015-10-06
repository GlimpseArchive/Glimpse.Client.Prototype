'use strict';

var messageProcessor = require('../util/request-message-processor');

var React = require('react');

var getMessages = (function() {
    var getItem = messageProcessor.getTypeMessageItem;
    
    var options = {
        'end-request-message': getItem,
        'begin-request-message': getItem,
        'action-message': getItem,
        'action-view-message': getItem,
        'action-content-message': getItem,
        'action-route-message': getItem
    };
		
    return function(request) {
		return messageProcessor.getTypeMessages(request, options); 
    }
})();

module.exports = React.createClass({
    render: function () {
        var request = this.props.request;
        var data = getMessages(request);
        
        var beginData = data.beginRequestMessage;
        var routeData = data.actionRouteMessage;
        var actionData = data.actionMessage;
        
        var route = <div>No route found yet.</div>;
        if (routeData) {
            var routePath = beginData ? (<div><span>{beginData.path}</span><span>{beginData.queryString}</span></div>) : '';
        
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
        if (actionData) {
            action = (
                    <section className="tab-execution-item tab-execution-action">
                        <div className="tab-execution-title">Action</div>
                        <div className="tab-execution-action-description tab-execution-important">
                            {actionData.controllerName}.{actionData.actionName}()
                        </div>
                        <div className="tab-execution-timing">{actionData.timing.elapsed}ms</div>
                    </section>
                ); 
        }
        
        return <div>{route}{action}</div>;
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
