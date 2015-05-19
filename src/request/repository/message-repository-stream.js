'use strict';

var glimpse = require('glimpse');

module.exports = {
    subscribeToSummariesLastest: function () {
        // TODO: Need to complete
        //       Subscribe via socket

        // simulate success callback
        setTimeout(function () {
            glimpse.emit('data.message.summary.found.stream', []);
        }, 0);
    },
    subscribeToDetailsFor: function (requestId) {
        // TODO: Need to complete
        //       Subscribe via socket

        // simulate success callback
        setTimeout(function () {
            glimpse.emit('data.message.detail.found.stream', []);
        }, 0);
    }
};
