'use strict';

var glimpse = require('glimpse');
var requestStore = require('./request-store-manage');

module.exports = {
    triggerGetDetailsFor: function (requestId) {
        var request = requestStore.data.index[requestId];
        if (request) {
            var requestRepositoryPayload = { 
                updatedRequests: [ request ],
                affectedRequests: [ request ]
            };
            
            glimpse.emit('data.request.detail.found.cache', requestRepositoryPayload);
        }
    }
};
