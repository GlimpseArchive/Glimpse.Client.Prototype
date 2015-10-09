'use strict';

var _ = require('lodash');

module.exports = {
	getTypeMessages: function(request, typeOptions) {
		var result = {};
		_.forEach(typeOptions, function(callback, key) {
			result[_.camelCase(key)] = callback(request, key)
		});
		
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
			return _.map(messageIds, function(id) { return request.messages[id].payload; });
		}
	},
	getSummaryMessages: function(request) {
		var processItem = module.exports.getTypeMessageItem;
		var processList = module.exports.getTypeMessageList;
		
		var options = {
			'user-identification': processItem,
			'end-request': processItem,
			'begin-request': processItem,
			'after-action-invoked': processItem,
			'after-action-view-invoked': processItem,
			'after-execute-command': processList
		};
		
		return module.exports.getTypeMessages(request, options); 
	}
};