'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');

var processMessages = function(messages) { 
    return {
        messages: messages,
        groupedById: _.groupBy(messages, 'context.id')
    };
};

// republish Found Summary
(function () {
    function republishFoundSummary(messages) {
        var payload = processMessages(messages);

        glimpse.emit('data.message.summary.found', payload);
    }

    glimpse.on('data.message.summary.found.stream', republishFoundSummary);
    glimpse.on('data.message.summary.found.remote', republishFoundSummary);
})();

// republish Found Details
(function () {
    function republishFoundDetail(messages) {
        var payload = processMessages(messages);

        glimpse.emit('data.message.detail.found', payload);
    }

    glimpse.on('data.message.detail.found.stream', republishFoundDetail);
    glimpse.on('data.message.detail.found.remote', republishFoundDetail);
})();
