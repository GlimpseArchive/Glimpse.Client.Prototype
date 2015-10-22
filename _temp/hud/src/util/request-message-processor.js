'use strict';

var util = require('lib/util.js');

module.exports = {
	getTypeMessages: function(request, typeOptions) {
		var result = {};
		for (var key in typeOptions) {
			var callback = typeOptions[key];
			result[util.toCamelCase(key)] = callback(request, key)
		}
		
		return result;
	},
	getTypeMessageItem: function(request, type) {
		var messageIds = request.types[type]; 
		if (messageIds)	{
			return request.messages[messageIds[0]].payload;
		}
	},
	getTypeMessageList: function(request, type) {
		var messageIds = request.types[type]; 
		if (messageIds)	{
			return messageIds.map(function(id) { return request.messages[id].payload; });
		}
	}
};