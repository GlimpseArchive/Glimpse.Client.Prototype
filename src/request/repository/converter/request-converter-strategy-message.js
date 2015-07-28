'use strict';

module.exports = function(request, message) {
    var didUpdate = false; 
    
    if (!request.messages[message.id]) {
        
        // ***** TEMP, not sure this should be at this place ****
        message.payload = JSON.parse(message.payload);
        // ***** TEMP, not sure this should be at this place ****
        
        request.messages[message.id] = message; 
        didUpdate = true;
    } 
    
    return didUpdate;
};