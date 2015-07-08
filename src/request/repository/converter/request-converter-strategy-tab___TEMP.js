'use strict';

module.exports = function(request, message) {
    var didUpdate = false; 
    
    // TODO: BAD BAD BAD HACK!!!! Only here to get things 
    //       up and runnting
    if (message.title) {
        if (!request.tabs) {
            request.tabs = {};
        }
         
        request.tabs[message.type] = {
                title: message.title,
                payload: message.payload
            };
        didUpdate = true;
    }
    
    return didUpdate;
};