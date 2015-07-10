'use strict';

var _ = require('lodash');

// TODO: this works for 1:1 still need to work out 1:M (i.e. filters)
// TODO: need to figure out when I clean this up... not hugely worried,
//       but need to come up with something. 

var relationship = (function() {
    var index = {};
    // TODO: longer term these shouldn't be hard coded
    var definitions = {  
        'request-framework-action': [ 'request-framework-result', 'request-framework-binding', 'request-framework-route' ],
        'request-framework-result': [ 'request-framework-action' ],
        'request-framework-binding': [ 'request-framework-action' ],
        'request-framework-route': [ 'request-framework-action' ]
    }; 

    return {
        getDefinition: function(message) {
            // TODO: need to parse type
            var definition = definitions[message.type];
            if (definition) {
                return {
                    sourceType: message.type,
                    relationTypes: definition
                };
            }
        },
        getScope: (function() {
            var create = function() { 
                return _.transform(definitions, function(result, value, key) {
                        result[key] = null;
                    });
            };
            
            return function(requestId, controller, action) { 
                var key = requestId + '||' + controller + '||' + action;
                return  index[key] || (index[key] = create());
            };
        }())
    };
})(); 

module.exports = function(request, message) {
    var didUpdate = false; 
    
    var messagePayload = message.payload;
    var messageDefinition = relationship.getDefinition(message); 
	
    if (messagePayload.controller && messagePayload.action && messageDefinition) { 
        var requestScope = relationship.getScope(message.context.id, messagePayload.controller, messagePayload.action);
        
        // setup links for futre use
        message.links = {};
        
        // store for easy lookup
        requestScope[messageDefinition.sourceType] = message;
        
        // create the links
        _.each(messageDefinition.relationTypes, function(relationType) {
            var relationMessage = requestScope[relationType];
            if (relationMessage) {
                // sets up the first link
                message.links[relationType] = relationMessage.id;
                
                // makes sure the reverse link is also there as needed
                var relationMessageDefinition = relationship.getDefinition(relationMessage);
                if (relationMessageDefinition && _.includes(relationMessageDefinition.relationTypes, messageDefinition.sourceType)) {
                    relationMessage.links[messageDefinition.sourceType] = message.id;
                }
            } 
        }); 
        
        didUpdate = true;
    }
    
    return didUpdate;
};