'use strict';

var glimpse = require('glimpse');

// TODO: Not sure if the data will ultimately live here or not
var summaryData = [];
var summaryDataByRequest = {};
var detailData = [];
var detailDataByRequest = {};

// TODO: Bad. Currently looping through this list twice, need to look at this.
//       Loops haven't been combined atm as I wanted the intent to be clearer
//       about what is happening.
var updateData = (function() {
    var updateRoot = function(messages, store) {
            Array.prototype.push.apply(store, messages);
        };
    var updateGrouped = function(messages, storeGroup) {
            for (var i = 0; i < messages.length; i++) {
                var message = messages[i];
                var contextId = message.context.id;

                // create array & store it if not present
                var group = storeGroup[contextId] || (storeGroup[contextId] = []);
                group.push(message);
            }
        };
    var createResult = function(messages, store, storeGroup) {
            var result = {
                newMessages: messages,
                allMessages: store,
                updatedMessagesByRequest: {}
            };

            for (var i = 0; i < messages.length; i++) {
                var message = messages[i];
                var contextId = message.context.id;

                // create object & store it if not present
                var resultGroup = result.updatedMessagesByRequest[contextId]
                    || (result.updatedMessagesByRequest[contextId]
                            = { newMessages: [], allMessages: storeGroup[contextId] });
                resultGroup.newMessages.push(message);
            }

            return result;
        };

    return function(messages, store, storeGroup) {
        updateRoot(messages, store);
        updateGrouped(messages, storeGroup);

        return createResult(messages, store, storeGroup);
    }
})();

// republish Found Summary
(function () {
    function republishFoundSummary(messages) {
        var payload = updateData(messages, summaryData, summaryDataByRequest);

        glimpse.emit('data.message.summary.found', payload);
    }

    glimpse.on('data.message.summary.found.stream', republishFoundSummary);
    glimpse.on('data.message.summary.found.remote', republishFoundSummary);  //TODO: not yet implemented
})();

// republish Found Details
(function () {
    function republishFoundDetail(messages) {
        var payload = updateData(messages, detailData, detailDataByRequest);

        glimpse.emit('data.message.detail.found', payload);
    }

    glimpse.on('data.message.detail.found.stream', republishFoundDetail);
    glimpse.on('data.message.detail.found.remote', republishFoundDetail);  //TODO: not yet implemented
})();
