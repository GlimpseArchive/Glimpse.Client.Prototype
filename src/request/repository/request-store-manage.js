'use strict';

var _ = require('lodash');
var moment = require('moment');
var glimpse = require('glimpse');
 
var data = {
    index: {},
    values: []
};

var processRequests = function(requestRepositoryPayload) {
        _.forEach(requestRepositoryPayload.newRequests, function(request) {
            // TODO: BIG BIG BIG PROBLEM HERE!!!!! datetime isn't always going to be here 
            //       most of the time datetime will come later and hence we 
            if (!data.index[request.id]) {
                var sortedIndex = _.sortedIndex(data.values, request, function(value) {
                    return moment(value.dateTime).valueOf() * -1;   // decending order 
                }); 
                
                data.values.splice(sortedIndex, 0, request); 
            }
            else { 
                // TODO: Perf wise this isn't great in terms of perf, fix later
                var currentIndex = _.findIndex(data.values, 'id', request.id); 
                data.values[currentIndex] = request;
            } 
            
            data.index[request.id] = request; 
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
    function republishFoundDetail(requestRepositoryPayload) {
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
