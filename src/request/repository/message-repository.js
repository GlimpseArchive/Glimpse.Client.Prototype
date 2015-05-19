'use strict';

require('./message-store-manage');

var remoteRepository = require('./message-repository-remote');
var streamRepository = require('./message-repository-stream');

// TODO: take groups of messages and translate into a request

module.exports = {
    triggerGetSummariesLastest: function () {
        remoteRepository.triggerGetSummariesLastest();
    },
    triggerGetDetailsFor: function (requestId) {
        remoteRepository.triggerGetDetailsFor(requestId);
    },
    subscribeToSummariesLastest: function () {
        // make sure we get new messages from server as they happen
        streamRepository.subscribeToSummariesLastest();
    },
    subscribeToDetailsFor: function (requestId) {
        // make sure we get updates for the request as they happen
        streamRepository.subscribeToDetailsFor(requestId);
    }
};
