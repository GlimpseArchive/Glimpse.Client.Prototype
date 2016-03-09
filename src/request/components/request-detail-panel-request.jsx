'use strict';

var messageProcessor = require('../util/request-message-processor');

var _ = require('lodash');
var React = require('react');

var getPayloads = (function() {
    var getItem = messageProcessor.getTypePayloadItem;
    
    var options = {
        'end-request': getItem,
        'begin-request': getItem
    };
		
    return function(request) {
		return messageProcessor.getTypeStucture(request, options); 
    }
})();

var RequestUrl = React.createClass({
    render: function() {
        return (
            <div>
                <div className="tab-section tab-section-execution-url">
                    <div className="flex flex-row flex-inherit tab-section-header">
                        <div className="tab-title col-10">Url</div>
                    </div>
                    <div>{this.props.url}</div>
                </div>
            </div>
        );
    }
});

var RequestHeaders = React.createClass({
    render: function() {
        return (
            <div>
                <div className="tab-section tab-section-execution-headers">
                    <div className="flex flex-row flex-inherit tab-section-header">
                        <div className="tab-title col-10">{this.props.title}</div>
                    </div>
                    <div className="tab-section-listing">
                        {_.map(this.props.headers, function(value, key) {
                            return (<section className="flex flex-row">
                                    <div className="col-2">{key}</div>
                                    <div className="col-8">{value}</div>
                                </section>);
                        })}
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = React.createClass({
    getInitialState: function () {
        return { checkedState: false };
    },
    render: function () {
        var request = this.props.request;
        
        // get payloads 
        var payload = getPayloads(request);
        var beginRequestPayload = payload.beginRequest;
        var endRequestPayload = payload.endRequest;
        
        var content = null;
        if (beginRequestPayload && endRequestPayload) {
            content = (
                <div>
                    <div className="tab-section text-minor">Web Request/Response</div>
                    <RequestUrl url={beginRequestPayload.url} />
                    <RequestHeaders title="Request Headers" headers={beginRequestPayload.headers} />
                    <RequestHeaders title="Response Headers" headers={endRequestPayload.headers} />
                </div>
            );
        }
        else {
            content = <div className="tab-section text-minor">Could not find any data.</div>;
        }
        
        return content;
    }
});


// TODO: Need to come up with a better self registration process
(function () {
    var requestTabController = require('../request-tab');

    requestTabController.registerTab({
        key: 'tab.request',
        title: 'Request',
        component: module.exports
    });
})();
