'use strict';

var glimpse = require('glimpse');
var polyfill = require('event-source')

var socket = (function() {
    var connection;

    var setup = function() {
        connection = new polyfill.EventSource('/glimpse/message-stream');
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
        check: function() {
            if (!connection) {
                setup();
            }
        }
    };
})();

module.exports = {
    subscribeToLastestSummaries: function () {
        socket.check();
    },
    subscribeToDetailsFor: function (requestId) {
        // TODO: Setup SSE code
    }
};
