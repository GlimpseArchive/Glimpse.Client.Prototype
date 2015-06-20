'use strict';

var glimpse = require('glimpse');

// store Found Summary
(function () {
    function processFoundSummary(requestRepositoryPayload) {
        // TODO: BIG DEAL confirm that this is ok being newRequests
        glimpse.emit('data.user.detail.found.internal', requestRepositoryPayload.newRequests);
    }
 
    glimpse.on('data.request.summary.found.message', processFoundSummary);
    // TODO: If we switch to storing session in local storage this needs to be removed
    glimpse.on('data.request.summary.found.local', processFoundSummary);
})();
