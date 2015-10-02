'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');

var _strategies = []; 

module.exports = { 
    registerStrategy: function(strategy) {
        _strategies.push(strategy);

        glimpse.emit('system.request.converter.strategy.added', { strategy: strategy });
    },
    createRequest: function(requestId) {
        return {
            id: requestId,
            messages: {}
        };
    },
    convertMessages: function(request, messages) {
        var didUpdate = false;
        
        // setup the type index
        if (!request.types) {
            request.types = {};
        }      
        
        _.forEach(messages, function(message) {  
            if (!request.messages[message.id]) {
                // copy across the messages into the message index 
                request.messages[message.id] = message; 
                
                // copy across the messages into the type index
                _.forEach(message.types, function(type) {
                    if (!request.types[type]) {
                        request.types[type] = [];
                    }
                    
                    request.types[type].push(message.id);
                });

                // run through the registered providers
                _.forEach(_strategies, function(action) { 
                    action(request, message) || didUpdate; 
                }); 
                
                didUpdate = true;
            } 
        });  
        
        return didUpdate;
    }
};

// TODO: Need to come up with a better self registration process
(function() {
    var registerStrategy = module.exports.registerStrategy;
    
    // NOTE: Removing for the time being... doesn't looks like this will be needed
    // TODO: Check if this can be removed
    registerStrategy(require('./request-converter-strategy-tab___TEMP'));
    registerStrategy(require('./request-converter-strategy-tab-message___TEMP'));
})();
