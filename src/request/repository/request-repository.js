'use strict';

require('./request-store-manage');

var localRequestRepository = require('./request-repository-local');
var messageRequestRepository = require('./request-repository-message');
var messageRepository = require('./message-repository');

module.exports = {
    triggerGetSummariesLastest: function () {
        if (!FAKE_SERVER) {
            // find any messages from server
            messageRepository.triggerGetSummariesLastest();
            // find any requests in stroage
            localRequestRepository.triggerGetSummariesLastest();

            // make sure we get new messages from server as they happen
            messageRepository.subscribeToSummariesLastest();
        }
    },
    triggerGetDetailsFor: function (requestId) {
        if (!FAKE_SERVER) {
            // find the messages from server
            messageRepository.triggerGetDetailsFor(requestId);
            // find the request in stroage
            localRequestRepository.triggerGetDetailsFor(requestId);

            // make sure we get updates for the request as they happen
            messageRepository.subscribeToDetailsFor(requestId);
        }
    }
};
