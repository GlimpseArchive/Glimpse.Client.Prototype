'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');
var requestStore = require('./request-store-manage');

var processMessages = (function() {
    var actions = (function() {
        var copyProperties = function(source, target) { 
            var didUpdate = false; 
            
            _.forEach(source, function(value, key) { 
                    if (value !== target[key]) {
                        target[key] = value; 
                        didUpdate = true;
                    }
                });
                    
             return didUpdate;
        };
        
        return {
            index: function(request, message) {  
                return copyProperties(message.index, request);
            },
            abstract: function(request, message) {
                var didUpdate = false; 
                
                if (message.abstract) {
                    var abstract = request.abstract || (request.abstract = {}); 
                    
                    didUpdate = copyProperties(message.abstract, abstract);
                }
                
                return didUpdate;
            },
            message: function(request, message) {
                var didUpdate = false; 
                
                if (!request.messages[message.id]) {
                    request.messages[message.id] = message; 
                    didUpdate = true;
                } 
                
                return didUpdate;
            },
        };
    })();
    
    var createRequest = function(requestId) {
        return {
            id: requestId,
            messages: {}
        };
    };
    
    var tryUpdateRequest = function(request, messages) {
        var didUpdate = false;
        
        _.forEach(messages, function(message) {  
            _.forEach(actions, function(action) { 
                didUpdate = action(request, message) || didUpdate; 
            });  
        });  
        
        return didUpdate;
    };
    
    return function(messagePayload) { 
        var requestStoreData = requestStore.data; 
        
        var requestRepositoryPayload = {
                newRequests: [],
                updatedRequests: [],
                affectedRequests: []
            };
        
        _.forEach(messagePayload.groupedById, function(messages, requestId) { 
            // get request object to work with
            var request = requestStoreData.index[requestId];
            var isNew = false;
            if (!request) { 
                request = (requestStoreData.index[requestId] = createRequest(requestId)); 
                isNew = true;
            } 
            
            var affectedRequest = tryUpdateRequest(request, messages);
            
            // store result for payload
            if (affectedRequest) {
                if (isNew) {
                    requestRepositoryPayload.newRequests.push(request);
                }
                else {
                    requestRepositoryPayload.updatedRequests.push(request);
                } 
                requestRepositoryPayload.affectedRequests.push(request);
            }
        });
        
        return requestRepositoryPayload;
    };
})(); 

// adapt Found Summary
(function () {
    function adaptMessageSummary(messagePayload) {
        var requestRepositoryPayload = processMessages(messagePayload);

        glimpse.emit('data.request.summary.found.message', requestRepositoryPayload);
    }

    glimpse.on('data.message.summary.found', adaptMessageSummary);
})();

// adapt Found Details
(function () {
    function adaptMessageDetail(messagePayload) {
        var requestRepositoryPayload = processMessages(messagePayload);

        glimpse.emit('data.request.detail.found.message', requestRepositoryPayload);
    }

    glimpse.on('data.message.detail.found', adaptMessageDetail);
})();
