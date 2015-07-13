'use strict';

var request = require('superagent');
var glimpse = require('glimpse');

module.exports = {
    triggerGetSummariesLastest: function () {
        request
            .get('/glimpse/api/messages') 
            .query({ latest: true })
            .set('Accept', 'application/json')
            .end(function(err, res){
                glimpse.emit('data.message.summary.found.remote', []);
            }); 
    },
    triggerGetDetailsFor: function (requestId) {
        request
            .get('/glimpse/api/messages') 
            .query({ context: requestId })
            .set('Accept', 'application/json')
            .end(function(err, res){
                glimpse.emit('data.message.summary.found.remote', []);
            }); 
    }
};
