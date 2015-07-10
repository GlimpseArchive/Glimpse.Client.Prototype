'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');

var _straties = []; 

module.exports = { 
    registerStrategy: function(strategy) {
        _straties.push(strategy);

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
            _.forEach(_straties, function(action) { 
                didUpdate = action(request, message) || didUpdate; 
            });  
        });  
        
        return didUpdate;
    }
};

// TODO: Need to come up with a better self registration process
(function() {
    var registerStrategy = module.exports.registerStrategy;
    
    registerStrategy(require('./request-converter-strategy-index'));
    registerStrategy(require('./request-converter-strategy-highlight'));
    registerStrategy(require('./request-converter-strategy-message'));
    registerStrategy(require('./request-converter-strategy-relationship'));
    registerStrategy(require('./request-converter-strategy-tab___TEMP'));
    registerStrategy(require('./request-converter-strategy-tab-message___TEMP'));
})();
