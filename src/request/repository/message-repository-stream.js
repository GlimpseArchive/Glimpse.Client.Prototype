'use strict';

var uriTemplates = require('uri-templates');
var glimpse = require('glimpse');
var polyfill = require('event-source')

var metadataRepository = require('../../shell/repository/metadata-repository');
var messageProcessor = require('../util/request-message-processor');

var createSocket = function(metadata, filter) {
    var uri = metadata.resources['message-stream'].fill(filter);
    
    var connection = new polyfill.EventSource(uri);
    connection.addEventListener('message', function(e) {
        if (!FAKE_SERVER) {
            glimpse.emit('data.message.summary.found.stream', JSON.parse(e.data));
        }
    });
    
    return connection;
};

var summarySocket = (function() {
    var connection;
    
    return {
        check: function(metadata) {
            if (!connection) {
                connection = createSocket(metadata, { types: Object.keys(messageProcessor.getSummaryMessagesStructure()) });
            }
        }
    };
})();
var detailsSocket = (function() {
    var connection;
    
    var tryClose = function() {
        if (connection) {
            connection.close();
        }
    };
    
    // close off when its not needed
    glimpse.on('data.request.detail.closed', tryClose);
    
    return {
        create: function(metadata, requestId) {
            tryClose();
            
            connection = createSocket(metadata, { requestId: requestId });
        }
    };
})();

module.exports = {
    subscribeToLastestSummaries: function() {
        metadataRepository.registerListener(function(metadata) {
            summarySocket.check(metadata);
        });
    },
    subscribeToDetailsFor: function(requestId) {
        metadataRepository.registerListener(function(metadata) {
            detailsSocket.create(metadata, requestId);
        });
    }
};
