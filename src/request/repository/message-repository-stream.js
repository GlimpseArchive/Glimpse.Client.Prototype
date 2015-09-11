'use strict';

var glimpse = require('glimpse');
var polyfill = require('event-source')

var socket = (function() {
    var connection;

    var setup = function() {
        connection = new polyfill.EventSource('/Glimpse/MessageStream');
        connection.onmessage = function(e) {
            if (!FAKE_SERVER) {
                glimpse.emit('data.message.summary.found.stream', e.data);
            }
        };
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
