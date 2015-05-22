'use strict';

var glimpse = require('glimpse');

// TODO: Not sure if the data will ultimately live here or not
var data = {
    summary: {
        list: [],
        grouping: {}
    },
    details: {
        list: [],
        grouping: {}
    }
}

// TODO: Bad!!! Currently looping through this list twice, need to look at this.
//       Loops haven't been combined atm as I wanted the intent to be clearer
//       about what is happening.
var process = (function() {
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

    // TODO: Got to be a better way, this works because the result is taretting
    //       only the relevent data collection.
    // NOTE: All summary messages are detail messages, but not all detail messages
    //       are summary messages.
    // NOTE: This assumes that the UI for the details will be listening to both
    //       summary and detail messages.
    return {
        summary: function(messages, data) {
            updateRoot(messages, data.summary.list);
            updateRoot(messages, data.details.list);
            updateGrouped(messages, data.summary.grouping);
            updateGrouped(messages, data.details.grouping);

            return createResult(messages, data.summary.list, data.summary.grouping);
        },
        details: function(messages, data) {
            updateRoot(messages, data.details.list);
            updateGrouped(messages, data.details.grouping);

            return createResult(messages, data.details.list, data.details.grouping);
        }
    };
})();

// republish Found Summary
(function () {
    function republishFoundSummary(messages) {
        var payload = process.summary(messages, data);

        glimpse.emit('data.message.summary.found', payload);
    }

    glimpse.on('data.message.summary.found.stream', republishFoundSummary);
    glimpse.on('data.message.summary.found.remote', republishFoundSummary);  //TODO: not yet implemented
})();

// republish Found Details
(function () {
    function republishFoundDetail(messages) {
        var payload = process.detail(messages, data);

        glimpse.emit('data.message.detail.found', payload);
    }

    glimpse.on('data.message.detail.found.stream', republishFoundDetail);
    glimpse.on('data.message.detail.found.remote', republishFoundDetail);  //TODO: not yet implemented
})();
