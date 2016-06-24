'use strict';

var _ = require('lodash');
var chance = require('./fake-extension'); // TODO: Can I just import chance and have this wired up differently
var moment = require('moment'); 
var request = require('superagent');
var requestMock = require('superagent-mocker')(request);
var glimpse = require('glimpse');
var polyfill = require('event-source');

// TODO: remove into its own module
var streamMock = (function() {
    var mocks = {};
    
    return {
        on: function(url, mockCallback) {
            mocks[url] = mockCallback;
        },
        trigger: function(url, userCallback) {
            for (var key in mocks) {
                if (url.indexOf(key) > -1) {
                    var result = mocks[key];
                    userCallback(result());
                    break;
                }
            }
        }
    };
})();

polyfill.EventSource = function(url) {
    this.url = url; 
    
    streamMock.trigger(url, function() {});
};
polyfill.EventSource.prototype = {
    addEventListener: function(topic, callback) {
    },
    close: function() {
    }
};

    
var _rawRequestCache = {};
 
var requestProcessor = {
    requests: {  
        summary: function(rawRequests) {
            var requests = _.map(rawRequests, 'request');
            var messages = _.union.apply(undefined, _.map(rawRequests, 'messages'));
            var newMessageTypes = {};
            
            // TODO: Would prefer not to have duplicate work work here (as request-repository-message)
            // process message types
            _.forEach(messages, function(message) {
                _.forEach(message.types, function(type) {
                    if (!newMessageTypes[type]) {
                        newMessageTypes[type] = [];
                    }
                    
                    newMessageTypes[type].push(message);
                });
            });
            
            return {
                newRequests: requests,
                updatedRequests: [],
                affectedRequests: requests,
                newMessages: messages,
                newMessageTypes: newMessageTypes
            };
        },
        detail: function(rawRequest) {
            var requests = [ rawRequest.request ];
            
            return {
                newRequests: requests,
                updatedRequests: [],
                affectedRequests: requests
            };
        }  
    },
    messages: { 
        summary: function(rawRequests) {
            var messages = [];
            _.forEach(rawRequests, function(request) { 
                _.forEach(request.messages, function(message) {  
                    // TODO: Need different logic here to targe which requests we should be sending down
                    if (!_.isEmpty(message.indices) || !_.isEmpty(message.abstract) 
                        || message.types[0] == 'user-identification' || message.types[0] == 'web-response' 
                        || message.types[0] == 'web-request' || message.types[0] == 'after-action-invoked'
                        || message.types[0] == 'after-action-view-invoked' || message.types[0] == 'after-execute-command'
                        || message.types[0] == 'browser-navigation-timing') { 
                        messages.push(message);
                    }
                });
            });
            
            return messages;
        },
        detail: function(rawRequest) {
            return rawRequest.messages; 
        } 
    }
};


// simulate summaries
var summaries = (function () {
    var maxEvents = chance.integerRange(25, 35);
    var leftEvents = maxEvents;
    
    var batch = (function() {
        var calculateOffset = function(seconds) {
            var date = new Date();
            var value = seconds * 1000;

            return moment(date.setTime(date.getTime() + value)).toISOString();
        };
        
        var generateResults = function(count, offset) {
            var results = [];
            for (var i = 0; i < count; i++) {
                offset -= chance.integerRange(30, 300);

                var dateTime = calculateOffset(offset); 
                var result = chance.mvcRequest(dateTime);

                results.push(result);
            }

            return results;
        };
        var cacheResults = function(rawResults) {
            _.forEach(rawResults, function(rawResult) {
                _rawRequestCache[rawResult.id] = rawResult;
            });
        };
        var publishResults = function(rawResults, publishAction, messageType, messageSource) {
            var results = publishAction(rawResults);
            
            glimpse.emit('data.' + messageType + '.summary.found.' + messageSource, results);
        };
        
        return function(count, messageType, messageSource, offset, publishAction) {
            leftEvents -= parseInt(count);
            
            console.log('[fake] ' + messageType + ':' + messageSource + ' - ' + (maxEvents - leftEvents) + ' of ' + maxEvents + ' (' + leftEvents + ' left, ' + parseInt(count) + ' just rendered)');
            
            var rawResults = generateResults(count, offset);
            cacheResults(rawResults);
            publishResults(rawResults, publishAction, messageType, messageSource);
        };
    })();

    var generate = { 
        local: function () { 
            // simulate requests happening more than a day ago
            batch(maxEvents * 0.25, 'request', 'local', 25 * 60 * 60 * -1, requestProcessor.requests.summary);
            
            // TODO: detail summary request objects just for these, and create full details just for some
        },
        remote: function () { 
            // simulate messages happening more than 10 seconds ago
            batch(maxEvents * 0.3, 'message', 'remote', 10 * -1, requestProcessor.messages.summary);
        }, 
        stream: function (position) {
            // simulate message happening now and possibly coming in at the same time
            
            // TODO: stream should not be subject to random time generation, currently is
            
            var count = chance.integerRange(0, 100) > 75 ? 2 : 1;  
            batch(count, 'message', 'stream', 0, requestProcessor.messages.summary);
            
            // lets make more happen
            setTimeout(function () {
                if (leftEvents > 0) {
                    generate.stream(position + count);
                }
            }, chance.integerRange(500, 15000));
        }
    };

    return {
        local: function() {
            // simulate requests from local store
            setTimeout(function () {
                generate.local();
            }, chance.integerRange(50, 100));
        },
        remote: function() {
            // simulate messages from remote
            setTimeout(function () {
                generate.remote();
            }, chance.integerRange(2000, 2500));
        },
        stream: function() {
            // simulate messages from stream
            setTimeout(function () {
                generate.stream(0);
            }, chance.integerRange(4000, 6000));
        }
    };
})();

// simulate details 
var details = (function () { 
    var requestsFound = function(messageType, messageSource, results) {
        glimpse.emit('data.' + messageType + '.detail.found.' + messageSource, results);
    };
    
    var generate = {  
        remote: function (id) { 
            // TODO: Should probably throw an exeption if record not found
            var rawRequest = _rawRequestCache[id];
            if (rawRequest) {  
                requestsFound('message', 'remote', requestProcessor.messages.detail(rawRequest));
            }
            else { 
                throw new TypeError('Shouldnt be trying to find a detail that we dont have a summary for');
            }
        }
    };

    return {
        remote: function (id) { 
            // simulate messages from remote
            setTimeout(function () {
                generate.remote(id);
            }, chance.integerRange(2000, 3000));
        }
    };
})();

// hook up listeners
(function () {
    glimpse.on('shell.request.ready', function() { 
        summaries.local();
    });
    
    // remote triggers 
    requestMock.get(window.location.origin + '/glimpse/message-history/?types=:types', function(req) {
        summaries.remote();
    }); 
    requestMock.get(window.location.origin + '/glimpse/context/:contextId', function(req) {
        details.remote(req.params.contextId.replace('?contextId=', '')); 
    });
    
    requestMock.get(window.location.origin + '/glimpse/telemetry-config', function(req) {
        return {
            "ok" : true,
            "body" : {
                "enabled": true,
                "uri": "https://vortex.data.microsoft.com/collect/v1",
                "instrumentationKey": "AIF-a96980ad-8a38-47a2-bbb0-328338b6964a"
            }
        }
    });

    requestMock.get(window.location.origin + '/glimpse/metadata', function(req){
       return {
           "ok" : true,
           "body" : {
                "resources": {
                    "client": window.location.origin + "/glimpse/client/index.html?hash={hash}{&requestId}",
                    "diagnostics": window.location.origin + "/glimpse/diagnostics/index.html?hash={hash}{&requestId}",
                    "hud": window.location.origin + "/glimpse/hud/hud.js?hash={hash}",
                    "agent": window.location.origin + "/glimpse/agent/agent.js?hash={hash}",
                    "message-stream": window.location.origin + "/glimpse/message-stream/{?types,contextId}",
                    "context": window.location.origin + "/glimpse/context/?contextId={contextId}{&types}",
                    "message-history": window.location.origin + "/glimpse/message-history/?types={types}",
                    "request-history": window.location.origin + "/glimpse/request-history/{?dmin,dmax,url,methods,smin,smax,tags,before,userId,types}",
                    "message-ingress": window.location.origin + "/glimpse/message-ingress/",
                    "metadata": window.location.origin + "/glimpse/metadata/?hash={hash}",
                    "script-options": window.location.origin + "/glimpse/script-options/{?hash}",
                    "telemetry-config": window.location.origin + "/glimpse/telemetry-config"
                },
                "hash": "801b465f"
            }
        }
    });
    
    // stream subscribers
    streamMock.on(window.location.origin + '/glimpse/message-stream/', function() {
        summaries.stream();
    });
})();
