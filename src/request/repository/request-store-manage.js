'use strict';

var _ = require('lodash');
var moment = require('moment');

var glimpse = require('glimpse');

var _data = {
    index: {},
    values: []
};

var processRequests = function(requestRepositoryPayload) {
        // TODO: BIG BIG BIG PROBLEM HERE!!!!! This assumes that the first time we see a request
        //       we will have the begin message... this isn't always the case. Hence when we
        //       don't have the begin request message on a new request we need to go through a
        //       reconcation process
        _.forEach(requestRepositoryPayload.newRequests, function(request) {
            if (!_data.index[request.id]) {
                var sortedIndex = 0;

                if (request._requestStartTime) {
                    sortedIndex = _.sortedIndexBy(_data.values, request, function(value) {
                        // TODO: This check wont really work because of the decending order logic
                        return value._requestStartTime ? moment(value._requestStartTime).valueOf() * -1 : 0;   // decending order
                    });
                }
                else {
                    // TODO: store in a list which marks it as being reconciled later
                }

                _data.values.splice(sortedIndex, 0, request);
            }
            else {
                // TODO: Perf wise this isn't great in terms of perf, fix later
                var currentIndex = _.findIndex(_data.values, [ 'id', request.id ]);
                _data.values[currentIndex] = request;
            }

            _data.index[request.id] = request;
        });

        return {
                newRequests: requestRepositoryPayload.newRequests,
                updatedRequests: requestRepositoryPayload.updatedRequests,
                affectedRequests: requestRepositoryPayload.affectedRequests,
                allRequests: _data.values,
                allRequestsIndex: _data.index,
                newMessages: requestRepositoryPayload.newMessages,
                newMessageTypes: requestRepositoryPayload.newMessageTypes
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

    // NOTE: the fact that we are listening to both cache and remote,
    //       means that we will get notifications from first and then
    //       from remote. This means that the same record could get
    //       multiple notifications for the one record. This is by design
    //       and shouldn't cause any side effects.

    glimpse.on('data.request.detail.found.cache', republishFoundDetail);
    glimpse.on('data.request.detail.found.message', republishFoundDetail);  //TODO: not yet implemented
})();

module.exports = {
    data: _data
};
