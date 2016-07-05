'use strict';

var messageProcessor = require('../util/request-message-processor');

var _ = require('lodash');
var React = require('react');
var Highlight = require('react-highlight');
var classNames = require('classnames');

var getPayloads = (function() {
    var getItem = messageProcessor.getTypePayloadItem;

    var options = {
        'web-response': getItem,
        'web-request': getItem,
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
        'web-response': getItem,
        'web-request': getItem,
        'before-action-invoked': getItem,
        'after-action-invoked': getItem,
        'before-execute-command': getList,
        'after-execute-command': getList,
        'before-view-component': getList,
        'after-view-component': getList,
        'after-action-result': getItem,
        'data-mongodb-insert': getList,
        'data-mongodb-read': getList,
        'data-mongodb-update': getList,
        'data-mongodb-delete': getList,
        'middleware-start': getList,
        'middleware-end': getList,
        'data-http-request': getList,
        'data-http-response': getList
    };

    return function(request) {
		return messageProcessor.getTypeStucture(request, options);
    }
})();

var combineMongoMessages = function(message) {
    // TODO: this can probably be replaced with just the below
    //       _(message.dataMongodbInsert).concat(message.dataMongodbRead, message.dataMongodbUpdate, message.dataMongodbDelete).sort(function(a, b) { return a.ordinal - b.ordinal; }).value()
    var mongoDBMessages = [];
    var m = [message.dataMongodbInsert, message.dataMongodbRead, message.dataMongodbUpdate, message.dataMongodbDelete];
    for (var i = 0; i < m.length; i++) {
        if (m[i] && m[i].length > 0) {
            mongoDBMessages = mongoDBMessages.concat(m[i]);
        }
    }
    if (mongoDBMessages) {
        mongoDBMessages = mongoDBMessages.sort(function(a,b) { return a.ordinal - b.ordinal;});
    }
    return mongoDBMessages;
};

var DetailListItem = React.createClass({
    render: function() {
        var value = this.props.value;
        if (value == null || value == '') {
            value = '--';
        }

        return (
                <section className="flex flex-row">
                    <div className="tab-section-details-key col-2"><div className="truncate">{this.props.title}:</div></div>
                    <div className="tab-section-details-value col-8"><div className="truncate">{value}</div></div>
                </section>
            );
    }
});

var MongoCommandMixin = {
    _makeUri: function(mongoOperation) {
        return mongoOperation.payload.connectionHost + ':' + mongoOperation.payload.connectionPort + '/' + mongoOperation.payload.database + '/' + mongoOperation.payload.collection;
    },
    getInitialState: function() {
        return { show: false };
    },
    onClick: function() {
        this.setState({ show: !this.state.show });
    },
    render: function() {
        var mongoOperation = this.props.mongoOperation;

        var showText = this.state.show ? 'close' : 'open';
        var containerClass = classNames({
                'tab-section-details': true,
                'tab-execution-hidden': !this.state.show,
                'pre-open': this.state.show
            });

        var duration = mongoOperation.payload.duration;

        var nesting = this.props.isRoot ? null : <span className="tab-execution-timing-arrow">➦</span>;

        var content = (
                <div className="tab-section-execution-command-item">
                    <div className="tab-section-execution-command-item-detail">
                        <div className="col-8">{this.getTitle()}<span className="tab-section-execution-command-open" onClick={this.onClick}>[{showText}]</span></div>
                        <div className="tab-execution-timing col-2">{duration} ms{nesting}</div>
                    </div>
                    <div className={containerClass} onClick={this.onClick}>
                        {this.getDetails()}
                        <div className="tab-execution-hidden-gradient"></div>
                    </div>
                </div>
            );

        return content;
     }
};

var MongoInsertCommand = React.createClass({
    mixins: [MongoCommandMixin],

    getTitle: function() {
        return 'Mongo DB - Inserted ' + this.props.mongoOperation.payload.count +  ' documents';
    },

    getDetails: function() {
        var mongoOperation = this.props.mongoOperation;
        var details =
            <div className="tab-section-details-item">
                <DetailListItem title="Operation" value={mongoOperation.payload.operation} />
                <DetailListItem title="Mongo DB URI" value={this._makeUri(mongoOperation)} />
                <DetailListItem title="Options" value={JSON.stringify(mongoOperation.payload.options)} />
            </div>;
        return details;
    }
});

var MongoReadCommand = React.createClass({
  mixins: [MongoCommandMixin],
  getTitle: function() {
      return 'Mongo DB - Read documents';
  },
  getDetails: function() {
        var mongoOperation = this.props.mongoOperation;
        var details =
            <div className="tab-section-details-item">
                <DetailListItem title="Operation" value={mongoOperation.payload.operation} />
                <DetailListItem title="Mongo DB URI" value={this._makeUri(mongoOperation)} />
                <DetailListItem title="Query" value={JSON.stringify(mongoOperation.payload.query)} />
                <DetailListItem title="Options" value={JSON.stringify(mongoOperation.payload.options)} />
            </div>;
        return details;
    }
});

var MongoUpdateCommand = React.createClass({
    mixins: [MongoCommandMixin],
    getTitle: function() {
        return 'Mongo DB - Updated ' + this.props.mongoOperation.payload.modifiedCount +  ' documents';
    },
    getDetails: function() {
        var mongoOperation = this.props.mongoOperation;
        var details =
            <div className="tab-section-details-item">
                <DetailListItem title="Operation" value={mongoOperation.payload.operation} />
                <DetailListItem title="Mongo DB URI" value={this._makeUri(mongoOperation)}  />
                <DetailListItem title="Matched count" value={mongoOperation.payload.matchedCount} />
                <DetailListItem title="Modified count" value={mongoOperation.payload.modifiedCount} />
                <DetailListItem title="Upserted count" value={mongoOperation.payload.upsertedCount} />
                <DetailListItem title="Query" value={JSON.stringify(mongoOperation.payload.query)} />
                <DetailListItem title="Options" value={JSON.stringify(mongoOperation.payload.options)} />
            </div>;
        return details;
    }
});

var MongoDeleteCommand = React.createClass({
    mixins: [MongoCommandMixin],
    getTitle: function() {
      return 'Mongo DB - Deleted ' + this.props.mongoOperation.payload.count +  ' documents';
    },
    getDetails: function() {
        var mongoOperation = this.props.mongoOperation;
        var details =
            <div className="tab-section-details-item">
                <DetailListItem title="Operation" value={mongoOperation.payload.operation} />
                <DetailListItem title="Mongo DB URI" value={this._makeUri(mongoOperation)} />
                <DetailListItem title="Query" value={JSON.stringify(mongoOperation.payload.query)} />
                <DetailListItem title="Options" value={JSON.stringify(mongoOperation.payload.options)} />
            </div>;
        return details;
    }
});

var HttpRequestItemHeaderList = React.createClass({
    render: function() {
        var headers = this.props.headers;
        if (headers) {
            return (
                    <div>{_.map(headers, function(value, key) {
                            return <DetailListItem title={key} value={value} />;
                        })}</div>
                );
        }

        return <div className="text-minor">No headers found.</div>;
    }
});
var HttpRequestItem = React.createClass({
    getInitialState: function() {
        return { show: false };
    },
    onClick: function() {
        this.setState({ show: !this.state.show });
    },
    render: function() {
        var httpRequest = this.props.httpRequest;
        var httpResponse = this.props.httpResponse;

        var showText = this.state.show ? 'close' : 'open';
        var containerClass = classNames({
                'tab-section-details': true,
                'tab-execution-hidden': !this.state.show,
                'pre-open': this.state.show
            });
        var nesting = this.props.isRoot ? null : <span className="tab-execution-timing-arrow">➦</span>;

        var content = (
                <div className="tab-section-execution-command-item">
                    <div className="tab-section-execution-command-item-detail">
                        <div className="col-8">{httpRequest.payload.path}{httpRequest.payload.query} <span className="tab-section-execution-command-accent text-minor" title="Is Async">{httpResponse.payload.statusCode} - {httpResponse.payload.statusText}</span><span className="tab-section-execution-command-open" onClick={this.onClick}>[{showText}]</span></div>
                        <div className="tab-execution-timing col-2">{httpResponse.payload.duration} ms{nesting}</div>
                    </div>
                    <div className={containerClass} onClick={this.onClick}>
                        <div className="flex">
                            <div className="col-5">Request Headers</div>
                            <div className="col-5">Response Headers</div>
                        </div>
                        <div className="flex">
                            <div className="tab-section-details-item col-5"><HttpRequestItemHeaderList headers={httpRequest.payload.headers} /></div>
                            <div className="tab-section-details-item col-5"><HttpRequestItemHeaderList headers={httpResponse.payload.headers} /></div>
                        </div>
                        <div className="tab-execution-hidden-gradient"></div>
                    </div>
                </div>
            );

        return content;
    }
});

var CommandItem = React.createClass({
    getInitialState: function() {
        return { show: false };
    },
    onClick: function() {
        this.setState({ show: !this.state.show });
    },
    render: function() {
        var beforeCommand = this.props.beforeCommand;
        var afterCommand = this.props.afterCommand;

        var showText = this.state.show ? 'close' : 'open';
        var containerClass = classNames({
                'tab-section-execution-command-text': true,
                'tab-execution-hidden': !this.state.show,
                'pre-open': this.state.show
            });
        var nesting = this.props.isRoot ? null : <span className="tab-execution-timing-arrow">➦</span>;

        var content = (
                <div className="tab-section-execution-command-item">
                    <div className="tab-section-execution-command-item-detail">
                        <div className="col-8">{beforeCommand.payload.commandMethod} <span className="tab-section-execution-command-accent text-minor" title="Is Async">{(beforeCommand.payload.commandIsAsync ? 'async' : '')}</span><span className="tab-section-execution-command-open" onClick={this.onClick}>[{showText}]</span></div>
                        <div className="tab-execution-timing col-2">{afterCommand.payload.commandDuration} ms{nesting}</div>
                    </div>
                    <div className={containerClass} onClick={this.onClick}>
                        <Highlight className="sql">
                            {beforeCommand.payload.commandText}
                        </Highlight>
                        <div className="tab-execution-hidden-gradient"></div>
                    </div>
                </div>
            );

        return content;
    }
});

var CommandList = React.createClass({
    render: function() {
        var beginMessage = this.props.beginMessage;
        var endMessage = this.props.endMessage;
        var beforeExecuteCommandMessages = this.props.beforeExecuteCommandMessages;
        var afterExecuteCommandMessages = this.props.afterExecuteCommandMessages;
        var mongoDBMessages = this.props.mongoDBMessages;
        var dataHttpRequestMessages = this.props.dataHttpRequestMessages;
        var dataHttpResponseMessages = this.props.dataHttpResponseMessages;

        var content = [];
        if (beginMessage && endMessage) {
            // sql commands
            if (beforeExecuteCommandMessages && afterExecuteCommandMessages) {
                var commandItems = [];
                for (var i = 0; i < beforeExecuteCommandMessages.length; i++) {
                    var beforeCommand = beforeExecuteCommandMessages[i];
                    var afterCommand = afterExecuteCommandMessages[i];
                    if (beforeCommand.ordinal > beginMessage.ordinal && afterCommand.ordinal < endMessage.ordinal) {
                        commandItems.push(<CommandItem key={beforeCommand.id} beforeCommand={beforeCommand} afterCommand={afterCommand} isRoot={this.props.isRoot} />);
                    }
                }

                // process action
                if (commandItems.length > 0) {
                    content.push(
                        <div key="sql" className="tab-section tab-section-boxed tab-section-execution-command">
                            <div className="flex flex-row flex-inherit tab-section-header">
                                <div className="tab-title col-9">SQL Query</div>
                            </div>
                            <div className="tab-section-boxing">
                                <section className="flex flex-row flex-inherit flex-base tab-section-item">
                                    <div className="tab-section-execution-command-items col-9">{commandItems}</div>
                                </section>
                            </div>
                        </div>
                    );
                }
            }

            // mongo commands
            if (mongoDBMessages) {
                var mongoOperations = [];
                for (var i = 0; i < mongoDBMessages.length; i++) {
                    if (mongoDBMessages[i].ordinal > beginMessage.ordinal && mongoDBMessages[i].ordinal < endMessage.ordinal) {
                        var commandItem = CreateMongoCommandItem(mongoDBMessages[i]);
                        if (commandItem) {
                            mongoOperations.push(commandItem);
                        }
                    }
                }

                // process action
                if (mongoOperations.length > 0) {
                    content.push(
                        <div key="mongo" className="tab-section tab-section-boxed tab-section-execution-command">
                            <div className="flex flex-row flex-inherit tab-section-header">
                                <div className="tab-title col-9">MongoDB Commands</div>
                            </div>
                            <div className="tab-section-boxing">
                                <section className="flex flex-row flex-inherit flex-base tab-section-item">
                                    <div className="tab-section-execution-command-items col-9">{mongoOperations}</div>
                                </section>
                            </div>
                        </div>
                    );
                }
            }

            // http client commands
            if (dataHttpRequestMessages && dataHttpResponseMessages) {
                var requestItems = [];
                for (var i = 0; i < dataHttpRequestMessages.length; i++) {
                    var httpRequest = dataHttpRequestMessages[i];
                    var httpResponse = dataHttpResponseMessages[i];
                    if (httpRequest.ordinal > beginMessage.ordinal && httpResponse.ordinal < endMessage.ordinal) {
                        requestItems.push(<HttpRequestItem key={httpRequest.id} httpRequest={httpRequest} httpResponse={httpResponse} isRoot={this.props.isRoot} />);
                    }
                }

                // process action
                if (requestItems.length > 0) {
                    content.push(
                        <div key="httpclient" className="tab-section tab-section-boxed tab-section-execution-command">
                            <div className="flex flex-row flex-inherit tab-section-header">
                                <div className="tab-title col-9">Http Client Requests</div>
                            </div>
                            <div className="tab-section-boxing">
                                <section className="flex flex-row flex-inherit flex-base tab-section-item">
                                    <div className="tab-section-execution-command-items col-9">{requestItems}</div>
                                </section>
                            </div>
                        </div>
                    );
                }
            }
        }

        return <div>{content}</div>;
    }
});

function CreateMongoCommandItem(mongoDBMessage) {
    // TODO:  should be a more efficient way to do the below, particularly since the mongo messages are a
    //        already sorted by message type.
    var item;
    if (_.intersection(mongoDBMessage.types, ['data-mongodb-insert']).length === 1){
        item = <MongoInsertCommand key={mongoDBMessage.id} mongoOperation={mongoDBMessage} />
    }
    else if (_.intersection(mongoDBMessage.types, ['data-mongodb-read']).length === 1){
       item = <MongoReadCommand key={mongoDBMessage.id} mongoOperation={mongoDBMessage} />
    }
    else if (_.intersection(mongoDBMessage.types, ['data-mongodb-update']).length === 1){
       item = <MongoUpdateCommand key={mongoDBMessage.id} mongoOperation={mongoDBMessage} />
    }
    else if (_.intersection(mongoDBMessage.types, ['data-mongodb-delete']).length === 1){
       item = <MongoDeleteCommand key={mongoDBMessage.id} mongoOperation={mongoDBMessage} />
    }
    return item;
}

var ParamaterList = React.createClass({
    render: function() {
        var argumentData = this.props.argumentData;

        var content = null;
        if (argumentData) {
            content = _.map(argumentData, function(item, i) {
                var value = '';
                if (item.value) {
                    if (typeof item.value == 'string') {
                        if (item.value == item.typeFullName) {
                            value = <span>= <span className="hljs-doctag">{'{'}object{'}'}</span></span>;
                        }
                        else {
                            value = <span>= <span className="hljs-string">"{item.value}"</span></span>;
                        }
                    }
                    else if (typeof item.value == 'boolean') {
                        value = <span>= <span className="hljs-keyword">{item.value.toString()}</span></span>;
                    }
                    else {
                        value = <span>= <span className="hljs-number">{item.value}</span></span>;
                    }
                }

                return <li key={i}><span className="hljs-keyword">{item.type}</span> <span className="hljs-params">{item.name}</span> {value}</li>;
            });

            content = <ul className="paramater-list">{content}</ul>
        }

        return content;
    }
});

var MiddlewareParameters = React.createClass({
    render: function() {
        var params = this.props.params;

        var paramComponents = _.map(params, function (value, key) {
            return (
                <div className="flex tab-section-details-item">
                    <div className="tab-section-details-key col-2"><div className="truncate">{key}:</div></div>
                    <div className="tab-section-details-value col-8"><div className="truncate">{value}</div></div>
                </div>
            );
        });

        return (
            <div>
                <div className="flex flex-row flex-inherit tab-section-header">
                    <div className="tab-title col-9">Parameters</div>
                </div>
                {paramComponents}
            </div>
        );
    }
});

var MiddlewareHeaders = React.createClass({
    render: function() {
        var headers = this.props.headers;

        var headerComponents = _.map(headers, function (value) {
            return (
                <div className="flex tab-section-details-item">
                    <div className="tab-section-details-key col-2"><div className="truncate">{value.name}:</div></div>
                    <div className="tab-section-details-value col-8"><div className="truncate">{value.values.join(', ')}</div></div>
                </div>
            );
        });

        return (
            <div>
                <div className="flex flex-row flex-inherit tab-section-header">
                    <div className="tab-title col-9">Headers</div>
                </div>
                {headerComponents}
            </div>
        );
    }
});

var MiddlewareItem = React.createClass({
    render: function() {
        var pair = this.props.messagePair;
        var beforeExecuteCommandMessages = this.props.beforeExecuteCommandMessages;
        var afterExecuteCommandMessages = this.props.afterExecuteCommandMessages;
        var mongoDBMessages = this.props.mongoDBMessages;
        var dataHttpRequestMessages = this.props.dataHttpRequestMessages;
        var dataHttpResponseMessages = this.props.dataHttpResponseMessages;

        var nestedComponent;

        if (pair.pairs.length > 0) {
            nestedComponent = pair.pairs.map(function (nestedPair){
                return <MiddlewareItem messagePair={nestedPair} beforeExecuteCommandMessages={beforeExecuteCommandMessages} afterExecuteCommandMessages={afterExecuteCommandMessages} mongoDBMessages={mongoDBMessages} dataHttpRequestMessages={dataHttpRequestMessages} dataHttpResponseMessages={dataHttpResponseMessages} />;
            });
        }
        else {
            nestedComponent = <CommandList beforeExecuteCommandMessages={beforeExecuteCommandMessages} afterExecuteCommandMessages={afterExecuteCommandMessages} mongoDBMessages={mongoDBMessages} dataHttpRequestMessages={dataHttpRequestMessages} dataHttpResponseMessages={dataHttpResponseMessages} beginMessage={pair.startMessage} endMessage={pair.endMessage} />
        }

        var middlewareEndPayload = pair.endMessage.payload;

        var method = null;

        if (middlewareEndPayload.method) {
            method = (
                <span className="text-minor">{middlewareEndPayload.method.toUpperCase()} &nbsp;</span>
            );
        }

        // NOTE: Since middleware is often attached to the "relative root" (i.e. '/') of any given route,
        //       we ignore paths === ['/'] to reduce the noise in the display and to emphasize non-root paths.

        var paths = null;

        if (middlewareEndPayload.paths
            && (middlewareEndPayload.paths.length > 1 || (middlewareEndPayload.paths.length == 1 && middlewareEndPayload.paths[0] != '/'))) {
            var pathsString;

            if (middlewareEndPayload.paths.length == 1) {
                pathsString = middlewareEndPayload.paths[0];
            }
            else {
                pathsString = '[' + middlewareEndPayload.paths.join(', ') + ']';
            }

            paths = (
                <span className="text-minor">{pathsString}</span>
            );
        }

        var route = null;

        if (method || paths) {
            route = (
                <section className="flex flex-row flex-inherit flex-base tab-section-item">
                    <div className="col-8">{method}{paths}</div>
                </section>
            );
        }

        var params = null;

        if (middlewareEndPayload.params && middlewareEndPayload.name != 'router') {
            params = <MiddlewareParameters params={middlewareEndPayload.params} />;
        }

        var headers = null;

        if (middlewareEndPayload.headers && middlewareEndPayload.name != 'router') {
            headers = <MiddlewareHeaders headers={middlewareEndPayload.headers} />;
        }

        var result = null;

        switch (middlewareEndPayload.result) {
            case 'next': result = /* Rightwards Arrow U+2192 */ String.fromCharCode(8594); break;
            case 'end': result = /* Rightwards Arrow to Bar U+21E5 */ String.fromCharCode(8677); break;
            case 'error': result = /* Exlamation Mark U+0021 */ String.fromCharCode(33); break;
        }

        var name = middlewareEndPayload.displayName || middlewareEndPayload.name || '<anonymous>';

        var packageLink = null;

        if (middlewareEndPayload.packageName) {
            var href = 'https://www.npmjs.com/package/' + middlewareEndPayload.packageName;

            packageLink = <a href={href} target="_blank">({middlewareEndPayload.packageName})</a>;
        }

        return (
                <div className="tab-section-boxing">
                    <section className="flex flex-row flex-inherit flex-base tab-section-item">
                        <div className="col-8">{name} &nbsp; {packageLink} &nbsp; <span className="text-minor">{result}</span></div>
                        <div className="tab-execution-timing">{middlewareEndPayload.duration} ms</div>
                    </section>
                    {route}
                    {params}
                    {headers}
                    {nestedComponent}
                </div>);
    }
});

var MiddlewareComponents = React.createClass({
    render: function() {
        var middlewareStartMessages = this.props.middlewareStartMessages || [];
        var middlewareEndMessages = this.props.middlewareEndMessages || [];
        var beforeExecuteCommandMessages = this.props.beforeExecuteCommandMessages;
        var afterExecuteCommandMessages = this.props.afterExecuteCommandMessages;
        var mongoDBMessages = this.props.mongoDBMessages;
        var dataHttpRequestMessages = this.props.dataHttpRequestMessages;
        var dataHttpResponseMessages = this.props.dataHttpResponseMessages;

        var middlewareMessages = middlewareStartMessages.concat(middlewareEndMessages).sort(function (a,b) { return a.ordinal - b.ordinal; });

        var content = null;

        if (middlewareMessages.length >= 2) {

            var rootPair = {
                pairs: []
            };

            var pairStack = [rootPair];

            for (var i = 0; i < middlewareMessages.length; i++) {
                var message = middlewareMessages[i];

                if (_.includes(message.types, 'middleware-start')) {
                    var pair = {
                        startMessage: message,
                        pairs: []
                    };

                    pairStack[pairStack.length - 1].pairs.push(pair);
                    pairStack.push(pair);
                }
                else {
                    var pair = pairStack.pop();

                    pair.endMessage = message;
                }
            }

            var generateMiddlewareItem = function (pair) {
                return <MiddlewareItem messagePair={pair} beforeExecuteCommandMessages={beforeExecuteCommandMessages} afterExecuteCommandMessages={afterExecuteCommandMessages} mongoDBMessages={mongoDBMessages} dataHttpRequestMessages={dataHttpRequestMessages} dataHttpResponseMessages={dataHttpResponseMessages} />;
            };

            var middlewareComponents = rootPair.pairs.map(generateMiddlewareItem);

            content = (
                    <div className="tab-section tab-section-boxed tab-section-execution-middleware">
                        <div className="flex flex-row flex-inherit tab-section-header">
                            <div className="tab-title col-9">Middleware</div>
                        </div>
                        {middlewareComponents}
                    </div>
            );
        }

        return content;
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
        var webRequestPayload = payload.webRequest;
        var webResponsePayload = payload.webResponse;
        var routePayload = payload.actionRoute;
        var contentPayload = payload.actionContent;
        var afterActionInvokedPayload = payload.afterActionInvoked;
        var actionViewFoundPayload = payload.actionViewFound;
        var afterActionViewInvokedPayload = payload.afterActionViewInvoked;

        var content = null;
        if (routePayload || afterActionInvokedPayload || actionViewFoundPayload || afterActionViewInvokedPayload) {
            // get messages
            var message = getMessages(request);
            var webRequestMessage = message.webRequest;
            var webResponseMessage = message.webResponse;
            var beforeActionInvokedMessage = message.beforeActionInvoked;
            var afterActionInvokedMessage = message.afterActionInvoked;
            var beforeExecuteCommandMessages = message.beforeExecuteCommand;
            var afterExecuteCommandMessages = message.afterExecuteCommand;
            var beforeViewComponentMessages = message.beforeViewComponent;
            var afterViewComponentMessages = message.afterViewComponent;
            var afterActionResultMessage = message.afterActionResult;
            var middlewareStartMessages = message.middlewareStart;
            var middlewareEndMessages = message.middlewareEnd;
            var dataHttpRequestMessages = message.dataHttpRequest;
            var dataHttpResponseMessages = message.dataHttpResponse;

            // intial processing of messages
            if (beforeExecuteCommandMessages && afterExecuteCommandMessages) {
                beforeExecuteCommandMessages = beforeExecuteCommandMessages.sort(function(a, b) { return a.ordinal - b.ordinal; });
                afterExecuteCommandMessages = afterExecuteCommandMessages.sort(function(a, b) { return a.ordinal - b.ordinal; });
            }
            if (dataHttpRequestMessages && dataHttpResponseMessages) {
                dataHttpRequestMessages = dataHttpRequestMessages.sort(function(a, b) { return a.ordinal - b.ordinal; });
                dataHttpResponseMessages = dataHttpResponseMessages.sort(function(a, b) { return a.ordinal - b.ordinal; });
            }
            var mongoDBMessages = combineMongoMessages(message);

            //process pre action commands
            var preCommands = null;
            if (webRequestMessage && beforeActionInvokedMessage) {
                preCommands = <CommandList beforeExecuteCommandMessages={beforeExecuteCommandMessages} afterExecuteCommandMessages={afterExecuteCommandMessages} mongoDBMessages={mongoDBMessages} dataHttpRequestMessages={dataHttpRequestMessages} dataHttpResponseMessages={dataHttpResponseMessages} beginMessage={webRequestMessage} endMessage={beforeActionInvokedMessage} isRoot={true} />
            }

            // process middleware
            var middleware = <MiddlewareComponents middlewareStartMessages={middlewareStartMessages} middlewareEndMessages={middlewareEndMessages} beforeExecuteCommandMessages={beforeExecuteCommandMessages} afterExecuteCommandMessages={afterExecuteCommandMessages} mongoDBMessages={mongoDBMessages} dataHttpRequestMessages={dataHttpRequestMessages} dataHttpResponseMessages={dataHttpResponseMessages} />

            // process route
            var route = null;
            if (routePayload) {
                var routePath = webRequestPayload ? (<span><span>{webRequestPayload.path}</span><span>{webRequestPayload.query}</span></span>) : '';

                route = (
                        <div className="tab-section tab-section-boxed tab-section-execution-route">
                            <div className="flex flex-row flex-inherit tab-section-header">
                                <div className="tab-title col-9">Route</div>
                            </div>
                            <div className="tab-section-boxing">
                                <section className="flex flex-row flex-inherit flex-base tab-section-item">
                                    <div className="col-2">{routePayload.routeName} - {routePath} &nbsp; <span className="text-minor">{routePayload.routePattern}</span></div>
                                </section>
                            </div>
                        </div>
                    );
            }

            // process action
            var action = null;
            if (afterActionInvokedPayload) {
                var content;
                if (contentPayload && contentPayload.binding) {
                    content = <ParamaterList argumentData={contentPayload.binding} />
                }

                action = (
                        <div className="tab-section tab-section-boxed tab-section-execution-action">
                            <div className="flex flex-row flex-inherit tab-section-header">
                                <div className="tab-title col-9">Action</div>
                            </div>
                            <div className="tab-section-boxing">
                                <section className="flex flex-row flex-inherit flex-base tab-section-item">
                                    <div className="tab-execution-important col-8">
                                        {afterActionInvokedPayload.actionControllerName}.{afterActionInvokedPayload.actionName}({content})
                                    </div>
                                    <div className="tab-execution-timing">{afterActionInvokedPayload.actionInvokedDuration} ms</div>
                                </section>
                                <CommandList test={true} beforeExecuteCommandMessages={beforeExecuteCommandMessages} afterExecuteCommandMessages={afterExecuteCommandMessages} mongoDBMessages={mongoDBMessages} dataHttpRequestMessages={dataHttpRequestMessages} dataHttpResponseMessages={dataHttpResponseMessages} beginMessage={beforeActionInvokedMessage} endMessage={afterActionInvokedMessage} />
                            </div>
                        </div>
                    );
            }

            // process view component
            var viewComponent = '';
            if (beforeViewComponentMessages && afterViewComponentMessages) {
                beforeViewComponentMessages = beforeViewComponentMessages.sort(function(a, b) { return a.ordinal - b.ordinal; });
                afterViewComponentMessages = _.keyBy(afterViewComponentMessages, 'payload.componentId');

                viewComponent = _.map(beforeViewComponentMessages, function(beforeViewComponetMessage, i) {
                    var beforeViewComponetPayload = beforeViewComponetMessage.payload;
                    var afterViewComponetMessage = afterViewComponentMessages[beforeViewComponetPayload.componentId];
                    var afterViewComponetPayload = afterViewComponetMessage.payload;

                    var componentCommands = <CommandList beforeExecuteCommandMessages={beforeExecuteCommandMessages} afterExecuteCommandMessages={afterExecuteCommandMessages} mongoDBMessages={mongoDBMessages} beginMessage={beforeViewComponetMessage} endMessage={afterViewComponetMessage} />;

                    return (
                            <div className="tab-section tab-section-boxed tab-section-execution-component">
                                <div className="flex flex-row flex-inherit tab-section-header">
                                    <div className="tab-title col-9">View Component</div>
                                </div>
                                <div className="tab-section-boxing">
                                    <section className="flex flex-row flex-inherit flex-base tab-section-item">
                                        <div className="tab-execution-important col-8">{beforeViewComponetPayload.componentName}</div>
                                        <div className="tab-execution-timing">{afterViewComponetPayload.componentDuration} ms<span className="tab-execution-timing-arrow">➦</span></div>
                                    </section>
                                    {componentCommands}
                                </div>
                            </div>
                        );
                });
            }

            // process action
            var view = null;
            if (actionViewFoundPayload && afterActionViewInvokedPayload) {
                var viewTitle = null;
                if (actionViewFoundPayload) {
                    viewTitle = <div><span className="tab-execution-important">{actionViewFoundPayload.viewName}</span> - <span>{actionViewFoundPayload.viewPath}</span></div>;
                }

                view = (
                        <div className="tab-section tab-section-boxed tab-section-execution-view">
                            <div className="flex flex-row flex-inherit tab-section-header">
                                <div className="tab-title col-9">View Result</div>
                            </div>
                            <div className="tab-section-boxing">
                                <section className="flex flex-row flex-inherit flex-base tab-section-item">
                                    <div className="tab-execution-important col-8">{viewTitle}</div>
                                    <div className="tab-execution-timing">{afterActionViewInvokedPayload.viewDuration} ms</div>
                                </section>
                                {viewComponent}
                            </div>
                        </div>
                    );
            }

            //process post action commands
            var postCommands = null;
            if (afterActionResultMessage && webResponseMessage) {
                postCommands = <CommandList beforeExecuteCommandMessages={beforeExecuteCommandMessages} afterExecuteCommandMessages={afterExecuteCommandMessages} mongoDBMessages={mongoDBMessages} dataHttpRequestMessages={dataHttpRequestMessages} dataHttpResponseMessages={dataHttpResponseMessages} beginMessage={afterActionResultMessage} endMessage={webResponseMessage} isRoot={true} />
            }

            content = (
                <div className="tab-content">
                    <div className="tab-section text-minor">Execution on Server</div>
                    {preCommands}{middleware}{route}{action}{view}{postCommands}
                </div>
            );
        }
        else {
            content = <div className="tab-content tab-section text-minor">Could not find any data.</div>;
        }

        return content;
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
