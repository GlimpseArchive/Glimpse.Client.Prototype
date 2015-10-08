'use strict';

var messageProcessor = require('../util/request-message-processor');

var React = require('react');

var getMessages = (function() {
    var getItem = messageProcessor.getTypeMessageItem;
    
    var options = {
        'end-request': getItem,
        'begin-request': getItem,
        'action': getItem,
        'action-view': getItem,
        'action-content': getItem,
        'action-route': getItem
    };
		
    return function(request) {
		return messageProcessor.getTypeMessages(request, options); 
    }
})();

module.exports = React.createClass({
    render: function () {
        var request = this.props.request;
        
        var data = getMessages(request);
        var beginData = data.beginRequest;
        var routeData = data.actionRoute;
        var actionData = data.action;
        var contentData = data.actionContent;
        var viewData = data.actionView;
        
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
                            {actionData.actionControllerName}.{actionData.actionName}({content})
                        </div>
                        <div className="tab-execution-timing">{actionData.actionDuration}ms</div>
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
