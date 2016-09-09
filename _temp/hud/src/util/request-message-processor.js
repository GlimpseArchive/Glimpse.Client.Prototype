'use strict';

var util = require('lib/util.js');

module.exports = {
    getTypeStucture: function(index, typeOptions) {
        var result = {};
        for (var key in typeOptions) {
            var callback = typeOptions[key];
            result[util.toCamelCase(key)] = callback(index, key)
        }

        return result;
    },
    getTypePayloadItem: function(index, type) {
        var messages = index[type];
        if (messages) {
            return messages[0].payload;
        }
    },
    getTypePayloadList: function(index, type) {
        var messages = index[type];
        if (messages) {
            return messages.map(function(message) { return message.payload; });
        }
    },
    getTypeMessageItem: function(index, type) {
        var messages = index[type];
        if (messages) {
            return messages[0];
        }
    },
    getTypeMessageList: function(index, type) {
        var messages = index[type];
        if (messages) {
            return messages;
        }
    }
};