'use strict';

var request = require('superagent');
var glimpse = require('glimpse');

module.exports = {
    triggerGetLastestSummaries: function () {
        request
            //.get('/glimpse/api/messages') 
            //.query({ latest: true })
            .get('/Glimpse/Data/History')  //TODO: this will probably change in time to the above
            .set('Accept', 'application/json')
            .end(function(err, res){
                if (res.ok) {
                    glimpse.emit('data.message.summary.found.remote', res.body);
                }
            }); 
    },
    triggerGetDetailsFor: function (requestId) {
        request
            .get('/glimpse/api/messages') 
            .query({ context: requestId })
            .set('Accept', 'application/json')
            .end(function(err, res){
                if (res.ok) {
                    glimpse.emit('data.message.summary.found.remote', res.body);
                }
            }); 
    }
};
