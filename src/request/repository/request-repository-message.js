'use strict';

var glimpse = require('glimpse');

var create = (function() {
    var processMessageSummary = function(request, message) {
        // process indexes (promoted to first class properties)
        if (message.indexes && message.indexes.length > 0) {
            for (var indexKey in message.indexes) {
                request[indexKey] = message.indexes[indexKey];
            }
        }

        // process abstract (placed in abstract property)
        if (message.abstract) {
            var abstract = request.abstract || (request.abstract = {});
            for (var abstractKey in message.abstract) {
                abstract[abstractKey] = message.abstract[abstractKey];
            }
        }
    };
    var processMessageDetail = function(request, message) {
        request.messages.push(message);
    };
    var processMessage = function(messagesForRequest, processAction) {
        var request = {};

        for (var i = 0; i < messagesForRequest.length; i++) {
            var message = messagesForRequest[i];

            processAction(request, message);
        }

        return request;
    };
    var processMessageList = function(messagesByRequest, processAction) {
        var requests = {};

        for (var requestId in messagesByRequest) {
            var messagesForRequest = messagesByRequest[requestId].allMessages;

            requests[requestId] = processMessage(messagesForRequest, processAction);
        }

        return requests;
    };

    var processActionSummary = function(request, message) {
        processMessageSummary(request, message);
    };
    var processActionDetail = function(request, message) {
        processMessageSummary(request, message);
        processMessageDetail(request, message);
    };

    return {
            summary: function(messages) {
                var requests = processMessageList(messages.updatedMessagesByRequest, processActionSummary);

                return requests;
            },
            detail: function(messages) {
                var requests = processMessageList(messages.updatedMessagesByRequest, processActionDetail);

                return requests;
            }
        };
})();

// adapt Found Summary
(function () {
    function adaptMessageSummary(messages) {
        var payload = create.summary(messages);

        glimpse.emit('data.request.summary.found.message', payload);
    }

    glimpse.on('data.message.summary.found', adaptMessageSummary);
})();

// adapt Found Details
(function () {
    function adaptMessageDetail(messages) {
        var payload = create.detail(messages);

        glimpse.emit('data.request.detail.found.message', payload);
    }

    glimpse.on('data.message.detail.found', adaptMessageDetail);
})();
