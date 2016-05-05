'use strict';

var _ = require('lodash');
var moment = require('moment');

var glimpse = require('glimpse');
var requestRepository = require('../repository/request-repository');
var messageProcessor = require('../util/request-message-processor');

var _requests = [];
var _requestIndex = {};
var _filteredRequests = [];
var _filters = { _responseContentCategory: true };  // TODO: remove hack to temp filter what requests we deal with
var _requestSelectedId = null;

function notifyRequestsChanged(targetRequests) {
    glimpse.emit('shell.request.summary.changed', targetRequests);
}

// TODO: Shift into different module
// TODO: This needs to be refactored to dynamically lookup records, etc
// TODO: Even at the moment this is going to need to be refactored
var filterRequests = (function () {
    var filterSchema = {
        _userId: { type: 'exact' },
        _requestUrl: { type: 'part' }, // TODO: Switch over to `regex` at some point
        _requestMethod: { type: 'array' },
        _responseStatusCode: { type: 'array' },
        _responseContentCategory: {   // TODO: remove hack to temp filter what requests we deal with
            type: 'exact',
            get: function (request) {
                return request._responseContentCategory && ((request._responseContentCategory.document && !request._requestIsAjax) || request._responseContentCategory.data);
            }
        }
    };
    var filterSchemaActions = {
        part: function(recordValue, filterValue) {
            return recordValue.indexOf(filterValue) > -1;
        },
        exact: function(recordValue, filterValue) {
            return recordValue === filterValue;
        },
        array: function(recordValue, filterValue) {
            var filterValues = filterValue.split(',').map(function (item) { return item.trim(); });

            return filterValues.indexOf(recordValue + '') > -1;
        }
    };

    function hasFilters(filters) {
        return Object.keys(filters).length;
    }

    function checkMatch(request, filters) {
        for (var key in filters) {
            var filterValue = filters[key];
            if (filterValue) {
                var schema = filterSchema[key];
                var schemaAction = filterSchemaActions[schema.type];
                var requestValue = schema.get ? schema.get(request) : request[key];

                // force to uppercase so that searches are case insensitive
                if (requestValue != undefined) { requestValue = requestValue.toString().toUpperCase(); }
                if (filterValue != undefined) { filterValue = filterValue.toString().toUpperCase(); }

                if (!schemaAction(requestValue, filterValue)) {
                    return false;
                }
            }
        }

        return true;
    }

    function applyFilters(targetRequests, destinationRequests, filters) {
        var matchFound = false;

        // TODO: BIG BIG BIG PROBLEM HERE!!!!! This assumes that the first time we see a request
        //       we will have the begin message... this isn't always the case. Hence when we
        //       don't have the begin request message on a new request we need to go through a
        //       reconcation process
        _.forEach(targetRequests, function(sourceRequest) {
            if (checkMatch(sourceRequest, filters)) {
                var sortedIndex = 0;

                if (sourceRequest._requestStartTime) {
                    sortedIndex = _.sortedIndexBy(destinationRequests, sourceRequest, function(value) {
                        // TODO: This check wont really work because of the decending order logic
                        return value._requestStartTime ? moment(value._requestStartTime).valueOf() * -1 : 0;   // decending order
                    });
                }
                else {
                    // TODO: store in a list which marks it as being reconciled later
                }

                destinationRequests.splice(sortedIndex, 0, sourceRequest);

                matchFound = true;
            }
        });

        return matchFound;
    }

    return function (allRequests, newRequests, filterHasChanged) {
        if (hasFilters(_filters)) {
            var targetRequests = newRequests;

            if (filterHasChanged) {
                targetRequests = allRequests;
                _filteredRequests = [];
            }

            var matchFound = applyFilters(targetRequests, _filteredRequests, _filters);
            if (!newRequests || matchFound || filterHasChanged) {
                notifyRequestsChanged(_filteredRequests);
            }
        } else {
            notifyRequestsChanged(_requests);
        }
    };
})();

// Update Filter
(function () {
    function updateFilter(payload) {
        for (var key in payload) {
            _filters[key] = payload[key];
        }

        filterRequests(_requests, null, true);
    }

    glimpse.on('shell.request.filter.updated', updateFilter);
})();

// Clear User
(function () {
    function clearUser() {
        _filters._userId = null;

        filterRequests(_requests, null, true);
    }

    glimpse.on('shell.request.user.clear.selected', clearUser);
})();

// Select User
(function () {
    function selectUser(payload) {
        _filters._userId = payload.userId;

        filterRequests(_requests, null, true);
    }

    glimpse.on('shell.request.user.selected', selectUser);
})();

// Clear Request
(function () {
    function clearRequest() {
        var request = _requestIndex[_requestSelectedId];
        if (request) {
            request._selected = false;
        }
        _requestSelectedId = null;

        filterRequests(_requests, [], false);
    }

    glimpse.on('shell.request.detail.closed', clearRequest);
})();

// Select Request
(function () {
    function clear(oldRequestId, requests) {
        if (oldRequestId) {
            var oldRequest = requests[oldRequestId];
            if (oldRequest) {
                oldRequest._selected = false;
            }
        }
    }
    function select(requestId, requests) {
        var request = requests[requestId];
        if (request) {
            request._selected = true;
        }
    }

    function selectRequest(payload) {
        var requestId = payload.requestId;
        var oldRequestId = _requestSelectedId;
        var requests = _requestIndex;

        clear(oldRequestId, requests);
        select(requestId, requests);

        _requestSelectedId = requestId;

        filterRequests(_requests, null, false);

        glimpse.emit('data.request.detail.requested', payload);
    }

    glimpse.on('shell.request.summary.selected', selectRequest);
})();

// Found Request
(function () {
    function foundRequest(payload) {
        // TODO: Really bad hack to get things going atm

        // Store data locally
        _requests = payload.allRequests;

        // TODO: BIG DEAL!!!!!! This should be affectedRequests
        for (var i = 0; i < payload.newRequests.length; i++) {
            var request = payload.newRequests[i];
            _requestIndex[request.id] = request;
        }

        filterRequests(_requests, payload.affectedRequests, false);
    }

    // External data coming in
    glimpse.on('data.request.summary.found', foundRequest);
})();

// Trigger Requests
// TODO: Look at changing the name of this to bring it into line with the above
(function () {
    function triggerRequest() {
        requestRepository.triggerGetLastestSummaries();
    }

    glimpse.on('shell.request.summary.requested', triggerRequest);
})();
