'use strict';

var helper = require('./request-converter-helper');

module.exports = function(request, message) {
    var didUpdate = false; 
    
    if (message.abstract) {
        var abstract = request.abstract || (request.abstract = {}); 
        
        didUpdate = helper.copyProperties(message.abstract, abstract);
    }
    
    return didUpdate;
};