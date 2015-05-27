'use strict';

var glimpse = require('glimpse');

// TODO: Not sure if the data will ultimately live here or not
var summaryData = [];
var detailData = [];

// republish Found Summary
(function () {
    function republishFoundSummary(requests) {
        // TODO: This is very naive atm, no sorting or indexing, etc present
        for (var i = requests.length - 1; i >= 0; i--) {
            summaryData.unshift(requests[i]);
        }

        var payload = {
            allRequests: summaryData,
            newRequests: requests
        };

        glimpse.emit('data.request.summary.found', payload);
    }

    // NOTE: the fact that we are listening to both local and message,
    //       means that we will get notifications from first and then
    //       from remote. This means that the same record could get
    //       multiple notifications for the one record. This is by design
    //       and shouldn't cause any side effects.

    glimpse.on('data.request.summary.found.local', republishFoundSummary);
    glimpse.on('data.request.summary.found.message', republishFoundSummary);  //TODO: not yet implemented
})();

// republish Found Details
(function () {
    function republishFoundDetail(requests) {
        Array.prototype.push.apply(detailData, requests); 

        glimpse.emit('data.request.detail.found', { allRequests: detailData, newRequests: requests });
    }

    // NOTE: the fact that we are listening to both local and remote,
    //       means that we will get notifications from first and then
    //       from remote. This means that the same record could get
    //       multiple notifications for the one record. This is by design
    //       and shouldn't cause any side effects.

    glimpse.on('data.request.detail.found.local', republishFoundDetail);
    glimpse.on('data.request.detail.found.message', republishFoundDetail);  //TODO: not yet implemented
})();
