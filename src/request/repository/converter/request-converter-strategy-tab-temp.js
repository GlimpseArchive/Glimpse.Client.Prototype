'use strict';

module.exports = function(request, message) {
    var didUpdate = false; 
    
	// TODO: Really bad hack to get messages showing in the UI 
    if (request.tabs) {     
    	var tabType = 'tab.messages';
    	if (!request.tabs[tabType]) {
        	didUpdate = true; 
    	    request.tabs[tabType] = {
    	            title: 'Messages',
    	            payload: request.messages
    	        };
    	}
    }
    
    return didUpdate;
};