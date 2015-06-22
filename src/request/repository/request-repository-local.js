'use strict';

var glimpse = require('glimpse');
var requestStore = require('./request-store-manage');

// store Found Summary
(function() {
    function storeFoundSummary(data) {
        // TODO: Need to complete
        //       Push into local storage
    }

    glimpse.on('data.request.summary.found.message', storeFoundSummary);
})();

// store Found Detail
(function() {
    function storeFoundDetail(data) {
        // TODO: Need to complete
        //       Push into local storage
    }

    glimpse.on('data.request.detail.found.message', storeFoundDetail);
})();

module.exports = {
    triggerGetSummariesLastest: function () {
        // TODO: Need to complete
        //       Pull from local storage
        
        // TODO: Push data into requestStore before publishing

        glimpse.emit('data.request.summary.found.local', []);
    }
    // Removeing under that asumption that any request object stored 
    // will be as "complete" as it can be for the information we have,
    // hence getting details here is pointless, as it represents the 
    // record that was retireved as a summary.
    // triggerGetDetailsFor: function (requestId) {
    //     ...
    // }
};
