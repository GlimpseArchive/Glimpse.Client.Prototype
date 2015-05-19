'use strict';

var glimpse = require('glimpse');

module.exports = {
    triggerGetSummariesLastest: function () {
        // TODO: Need to complete
        //       Ajax call to REST endpoint

        // simulate success callback
        setTimeout(function () {
            glimpse.emit('data.message.summary.found.remote', []);
        }, 0);
    },
    triggerGetDetailsFor: function (requestId) {
        // TODO: Need to complete
        //       Ajax call to REST endpoint

        // simulate success callback
        setTimeout(function () {
            glimpse.emit('data.message.detail.found.remote', []);
        }, 0);
    }
};
