'use strict';

var glimpse = require('glimpse');
var $ = require('lib/modules/jquery-signalr.js');

var socket = (function() {
    var connection;

    var setup = function() {
        connection = $.hubConnection('/Glimpse/Data/Stream', { useDefaultPath: false });
        
        var messageProxy = connection.createHubProxy('messageClientChannelSender');
        messageProxy.on('summaryMessage', function(message) {  
            if (!FAKE_SERVER) {
                glimpse.emit('data.message.summary.found.stream', [ message ]);
            }
        });
        messageProxy.on('detailMessage', function(message) {  
            if (!FAKE_SERVER) {
                glimpse.emit('data.message.detail.found.stream', [ message ]);
            }
        });
        
        connection.start({ withCredentials: false })
            .done(function() { console.log('Now connected, connection ID=' + connection.id); })
            .fail(function() { console.log('Could not connect'); });
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
        // TODO: need to do something about switching feeds, not sure yet
        socket.check();
    }
};
