'use strict';

var _ = require('lodash');

module.exports = function(request, message) {
    var didUpdate = false; 
    
    if (!request.types) {
        request.types = {};
    }
       
    _.forEach(message.types, function(type) {
        if (!request.types[type]) {
            request.types[type] = [];
        }
        
        request.types[type].push(message.id);
    });
    
    return didUpdate;
};