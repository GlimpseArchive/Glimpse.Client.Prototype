'use strict';

var _ = require('lodash');
var moment = require('moment');
var glimpse = require('glimpse');
var util = require('lib/util');
var messageProcessor = require('./util/request-message-processor');

(function() {
    var deepLinkRequestId;
    var deepLinkUserId;
    var deepLinkRequestStartTime;
    var detailSubscription;
    var summarySubscription;

    var checkUrl = function() {
        var requestId = util.getQueryStringParam('requestId');
        if (requestId) {
            deepLinkRequestId = requestId;

            if (util.getQueryStringParam('follow')) {
                detailSubscription = glimpse.on('data.request.detail.found', foundRequestDetail);
            }

            glimpse.emit('shell.request.summary.selected', { requestId: requestId })
        }
    };

    // NOTE: assumes that user message is going to be in detail response we get
    var foundRequestDetail = function(foundRequest) {
        var request = foundRequest.allRequestsIndex[deepLinkRequestId];
        if (request) {
            glimpse.off(detailSubscription);

            // TODO: possibly race condition here... need to look into it more
            if (request._userId && request._requestStartTime) {
                deepLinkUserId = request._userId;
                deepLinkRequestStartTime = request._requestStartTime;

                summarySubscription = glimpse.on('data.request.summary.found', foundRequestSummary);
            }
        }
    };

    var foundRequestSummary = function(foundRequests) {
        _.each(foundRequests.affectedRequests, function(request) {
            // if its the same user, and this new requet happens after this one and its of document type
            if (request._userId == deepLinkUserId
                && moment(request._requestStartTime).isAfter(deepLinkRequestStartTime)
                && !request._requestIsAjax
                && request._responseContentType && request._responseContentType.indexOf('text/html') > -1) {
                    glimpse.emit('shell.request.summary.selected', { requestId: request.id });
            }
        });
    };

    var clearRequest = function() {
        if (deepLinkRequestId) {
            // TODO:  summarySubscription is null and this causes exceptions, blcoking subsequent listeners on
            // the "shell.request.detail.closed' event.
            if (summarySubscription) {
                glimpse.off(summarySubscription);
            }

            deepLinkRequestStartTime = null;
            deepLinkRequestId = null;
            deepLinkUserId = null;
        }
    };

    glimpse.on('shell.request.ready', checkUrl);
    glimpse.on('shell.request.detail.closed', clearRequest);
})();