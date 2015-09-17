'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');
var requestStore = require('./request-store-manage');
var requestConverter = require('./converter/request-converter');

var processMessages = (function() {
    return function(messagePayload) { 
        var requestStoreData = requestStore.data; 
        
        var requestRepositoryPayload = {
                newRequests: [],
                updatedRequests: [],
                affectedRequests: [],
                newMessages: messagePayload.messages,
                newMessageTypes: {}
            };
        
        _.forEach(messagePayload.groupedById, function(messages, requestId) { 
            // get request object to work with
            var request = requestStoreData.index[requestId];
            var isNew = false;
            if (!request) { 
                request = requestConverter.createRequest(requestId);
                isNew = true;
            } 
            
            var affectedRequest = requestConverter.convertMessages(request, messages);
            
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
        
        // process message types
        _.forEach(messagePayload.messages, function(message) {
            _.forEach(message.types, function(type) {
                if (!requestRepositoryPayload.newMessageTypes[type]) {
                    requestRepositoryPayload.newMessageTypes[type] = [];
                }
                
                requestRepositoryPayload.newMessageTypes[type].push(message);
            });
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
