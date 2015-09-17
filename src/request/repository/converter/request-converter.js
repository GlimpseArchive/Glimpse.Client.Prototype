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
        
        _.forEach(messages, function(message) {  
            if (!request.messages[message.id]) {
                request.messages[message.id] = message; 

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
    
    registerStrategy(require('./request-converter-strategy-index'));
    registerStrategy(require('./request-converter-strategy-highlight'));
    registerStrategy(require('./request-converter-strategy-types'));
    // NOTE: Removing for the time being... doesn't looks like this will be needed
    // TODO: Check if this can be removed
    //registerStrategy(require('./request-converter-strategy-relationship'));
    registerStrategy(require('./request-converter-strategy-tab___TEMP'));
    registerStrategy(require('./request-converter-strategy-tab-message___TEMP'));
})();
