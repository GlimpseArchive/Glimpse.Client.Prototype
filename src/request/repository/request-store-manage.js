'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');
 
var data = {
    index: {},
    values: []
};

var processRequests = function(requestRepositoryPayload) {
        _.forEach(requestRepositoryPayload.newRequests, function(request) {
            // TODO: BIG BIG BIG PROBLEM HERE!!!!! datetime isn't always going to be here 
            //       most of the time datetime will come later and hence we 
            data.values.splice(_.sortedIndex(data.values, request, 'datetime'), 0, request);
        });
        
        return {
                newRequests: requestRepositoryPayload.newRequests,
                updatedRequests: requestRepositoryPayload.updatedRequests,
                affectedRequests: requestRepositoryPayload.affectedRequests,
                allRequests: data.values
            };
};

// republish Found Summary
(function () {
    function republishFoundSummary(requestRepositoryPayload) { 
        var requestPayload = processRequests(requestRepositoryPayload);
        
        glimpse.emit('data.request.summary.found', requestPayload);
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
        var requestPayload = processRequests(requestRepositoryPayload);

        glimpse.emit('data.request.detail.found', requestPayload);
    }

    // NOTE: the fact that we are listening to both local and remote,
    //       means that we will get notifications from first and then
    //       from remote. This means that the same record could get
    //       multiple notifications for the one record. This is by design
    //       and shouldn't cause any side effects.

    glimpse.on('data.request.detail.found.local', republishFoundDetail);
    glimpse.on('data.request.detail.found.message', republishFoundDetail);  //TODO: not yet implemented
})();

module.exports = {
    data: data
};
