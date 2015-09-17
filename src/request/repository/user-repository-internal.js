'use strict';

var glimpse = require('glimpse');

// store Found Summary
(function () {
    function processFoundSummary(requestRepositoryPayload) {
        var targetRequests = requestRepositoryPayload.newMessageTypes['user-identification'];
        if (targetRequests) {
            glimpse.emit('data.user.detail.found.internal', targetRequests);
        }
    }
 
    glimpse.on('data.request.summary.found.message', processFoundSummary);
    // TODO: If we switch to storing session in local storage this needs to be removed
    glimpse.on('data.request.summary.found.local', processFoundSummary);
})();
