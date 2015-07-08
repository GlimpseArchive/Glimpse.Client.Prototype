'use strict';

module.exports = function(request, message) {
    var didUpdate = false; 
    
	// TODO: Really bad hack to get messages showing in the UI  
	var tabType = 'tab.messages';
	if (!request.tabs) {
    	didUpdate = true; 
        request.tabs = {};
	    request.tabs[tabType] = {
	            title: 'Messages',
	            payload: request.messages
	        };
	} 
    
    return didUpdate;
};