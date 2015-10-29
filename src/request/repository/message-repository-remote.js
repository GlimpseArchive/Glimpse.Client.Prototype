'use strict';

var uriTemplates = require('uri-templates');
var request = require('superagent');
var glimpse = require('glimpse');

var metadataRepository = require('../../shell/repository/metadata-repository');
var messageProcessor = require('../util/request-message-processor');

module.exports = {
    triggerGetLastestSummaries: function() {
        metadataRepository.registerListener(function(metadata){
            var uri = metadata.resources['message-history']
                .fill({
                    hash: metadata.hash,
                    types: Object.keys(messageProcessor.getSummaryMessagesStructure())
                });
            
            request
                .get(uri) 
                .set('Accept', 'application/json')
                .end(function(err, res){ 
                    // this is done because we want to delay the response
                    if (!FAKE_SERVER) {
                        if (res.ok) {
                            glimpse.emit('data.message.summary.found.remote', res.body);
                        }
                        else {
                            console.log('ERROR: Error reaching server for summary request')
                        }  
                    }
                }); 
        });
    },
    triggerGetDetailsFor: function(contextId) {
        metadataRepository.registerListener(function(metadata){
            var uri = metadata.resources['context']
                .fill({
                    hash: metadata.hash,
                    contextId: contextId
                });
    
            request
                .get(uri) 
                .set('Accept', 'application/json')
                .end(function(err, res){ 
                    // this is done because we want to delay the response
                    if (!FAKE_SERVER) {
                        if (res.ok) {
                            glimpse.emit('data.message.detail.found.remote', res.body);
                        }
                        else {
                            console.log('ERROR: Error reaching server for detail request')
                        }  
                    }
                }); 
        });
    }
};
