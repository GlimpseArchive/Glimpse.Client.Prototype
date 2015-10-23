'use strict';

var util = require('lib/util.js');

module.exports = {
	getTypeMessages: function(index, typeOptions) {
		var result = {};
		for (var key in typeOptions) {
			var callback = typeOptions[key];
			result[util.toCamelCase(key)] = callback(index, key)
		}
		
		return result;
	},
	getTypeMessageItem: function(index, type) {
		var messages = index[type]; 
		if (messages)	{
			return messages[0].payload;
		}
	},
	getTypeMessageList: function(index, type) {
		var messages = index[type]; 
		if (messages)	{
			return messages.map(function(message) { return message.payload; });
		}
	}
};