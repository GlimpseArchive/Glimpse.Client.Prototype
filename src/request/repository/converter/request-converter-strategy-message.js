'use strict';

module.exports = function(request, message) {
    var didUpdate = false; 
    
    if (!request.messages[message.id]) {
        request.messages[message.id] = message; 
        didUpdate = true;
    } 
    
    return didUpdate;
};