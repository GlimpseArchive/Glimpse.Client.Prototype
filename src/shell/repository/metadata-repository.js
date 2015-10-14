'use strict';

var request = require('superagent');
var glimpse = require('glimpse');

var uriTemplate = require("uri-templates");

var _metadata = null;
var _callbacks = [];

function flushListeners(metadata){
    while (_callbacks.length > 0){
        var callback = _callbacks.shift();
        callback(metadata);
    }
};

function templatize(metadata){
    Object.keys(metadata.resources).forEach(function(key){
        metadata.resources[key] = uriTemplate(metadata.resources[key]);
    });
    
    return metadata;
}

module.exports = {
	triggerGetMetadata: function(){
        // TODO: Make this better w/ a custom dialog, caching & perhaps a list of recently used servers?
        //var baseUri = prompt('What\'s the address to your Glimpse server?', window.location.origin + '/glimpse/');
        var baseUri = window.location.origin + '/glimpse/';
        
        // This check is here because the baseUri may be input by hand
        if (baseUri.lastIndexOf('/') !== baseUri.length-1) // ensure trailing /
            baseUri += '/';
        
        request
            .get(baseUri + 'metadata')
            .accept('application/vnd.glimpse.metadata+json,application/json')
            .end(function(err, res){ 
                if (err){
                    console.error('Glimpse metadata could not be obtained.');
                }
                else{
                    _metadata = templatize(res.body);
                    flushListeners(_metadata);
                }
            });
	},
    registerListener: function(callback){
        if(_metadata){
            callback(_metadata);
            return;
        }
         
        _callbacks.push(callback);
    }
};