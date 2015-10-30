'use strict';

var request = require('superagent');
var glimpse = require('glimpse');
var util = require('../../lib/util');

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
        
        var metadataUri = util.getQueryStringParam('metadataUri');
        
        if (!metadataUri) {
            if (!FAKE_SERVER) {
                // TODO: Make this better w/ a custom dialog, caching & perhaps a list of recently used servers?
                metadataUri = prompt('What\'s the address to your Glimpse server metadata?', window.location.origin + '/glimpse/metadata');
            }
            else {
                metadataUri = window.location.origin + '/glimpse/metadata';
            }
        }
      
        request
            .get(metadataUri)
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