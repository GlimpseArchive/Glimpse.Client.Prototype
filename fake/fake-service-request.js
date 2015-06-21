'use strict';

var _ = require('lodash');
var chance = require('./fake-extension'); // TODO: Can I just import chance and have this wired up differently
var moment = require('moment'); 
var glimpse = require('glimpse');
    
var rawRequestCache = {};
var detailsRetrievedCache = {};
 
var requestProcessor = {
    requests: {  
        summary: function(rawRequests) {
            var requests = _.map(rawRequests, 'request');
            
            return {
                newRequests: requests,
                updatedRequests: [],
                affectedRequests: requests
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
                    if (!_.isEmpty(message.index) || !_.isEmpty(message.abstract)) { 
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
var triggerGetLastestSummaries = (function () {
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
                rawRequestCache[rawResult.id] = rawResult;
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
        },
        remote: function () { 
            // simulate messages happening more than 10 seconds ago
            batch(maxEvents * 0.3, 'message', 'remote', 10 * -1, requestProcessor.messages.summary);
        }, 
        stream: function (position) {
            // simulate message happening now and possibly coming in at the same time
            var count = chance.integerRange(0, 100) > 75 ? 2 : 1;  
            batch(count, 'message', 'stream', 0, requestProcessor.messages.summary);
             
            // lets make more happen
            setTimeout(function () {
                if (position < leftEvents) {
                    generate.stream(position + count);
                }
            }, chance.integerRange(500, 15000));
        }
    };

    return function () {
        // simulate requests from local store
        setTimeout(function () {
            generate.local();
        }, chance.integerRange(50, 100));

        // simulate messages from remote
        setTimeout(function () {
            generate.remote();
        }, chance.integerRange(2000, 2500));

        // simulate messages from stream
        setTimeout(function () {
            generate.stream(0);
        }, chance.integerRange(4000, 6000));
    };
})();

// simulate details
var triggerGetDetailsFor = (function () { 
    var requestsFound = function(messageType, messageSource, results) {
        glimpse.emit('data.' + messageType + '.detail.found.' + messageSource, results);
    }
    
    var modifyForSummaryRequest = function(request) {
        
    }

    var generate = { 
        local: function (id) { 
            var rawRequest = detailsRetrievedCache[id];
            
            if (!rawRequest) {
                // simulate returning the summary of the request object that we have
                // in reality we would always have this, but its good to make the 
                // system more pesimistic than not 
                if (chance.integerRange(1, 2) > 1) { 
                    rawRequest = _.clone(rawRequestCache[id], true); 
                    rawRequest.request.tabs = undefined;
                    
                }
            }
            
            if (rawRequest) { 
                requestsFound('request', 'local', requestProcessor.requests.detail(rawRequest));
            } 
        },
        remote: function (id) { 
            // TODO: Should probably throw an exeption if record not found
            var rawRequest = rawRequestCache[id];
            if (rawRequest) { 
                // store it for next time to help simulate local storeage caching
                detailsRetrievedCache[id] = rawRequest;

                requestsFound('message', 'remote', requestProcessor.messages.detail(rawRequest));
            }
            else { 
                throw new TypeError('Shouldnt be trying to find a detail that we dont have a summary for');
            }
        }
    };

    return function (id) {
        // simulate messages from local store
        setTimeout(function () {
            generate.local(id);
        }, chance.integerRange(10, 50));

        // simulate messages from remote
        setTimeout(function () {
            generate.remote(id);
        }, chance.integerRange(2000, 3000));
    };
})();

// hook up listeners
(function () {
    function requestReady() {
        triggerGetLastestSummaries();
    }

    glimpse.on('shell.request.ready', requestReady);
})();

(function () {
    function detailRequested(payload) {
        triggerGetDetailsFor(payload.requestId);
    }
 
    glimpse.on('data.request.detail.requested', detailRequested);
})();
