'use strict';

var glimpse = require('glimpse');
var polyfill = require('event-source')

var metadataRepository = require('../../shell/repository/metadata-repository');
var uriTemplates = require('uri-templates');

var socket = (function() {
    var connection;

    var setup = function(metadata) {
        var uri = metadata.resources["message-stream"].fill({ hash: metadata.Hash });
        
        connection = new polyfill.EventSource(uri);
        connection.addEventListener('message', function(e) {
            if (!FAKE_SERVER) {
                glimpse.emit('data.message.summary.found.stream', JSON.parse(e.data));
            }
        });
        connection.addEventListener('ping', function(e) {
            if (!DIAGNOSTICS) {
                console.log('[repo] Server is still alive');
            }
        });
    }; 
    
    return {
        check: function(metadata) {
            if (!connection) {
                setup(metadata);
            }
        }
    };
})();

module.exports = {
    subscribeToLastestSummaries: function () {
        metadataRepository.registerListener(function(metadata) {
            socket.check(metadata);
        });
    },
    subscribeToDetailsFor: function (requestId) {
        // TODO: Setup SSE code
    }
};
