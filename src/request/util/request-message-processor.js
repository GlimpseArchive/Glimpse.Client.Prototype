'use strict';

var _ = require('lodash');

module.exports = {
	getMessageTypes: function(){
		var processItem = module.exports.getTypeMessageItem;
		var processList = module.exports.getTypeMessageList;
		
		return {
			'user-identification': processItem,
			'end-request': processItem,
			'begin-request': processItem,
			'after-action-invoked': processItem,
			'after-action-view-invoked': processItem,
			'after-execute-command': processList
		};
	},
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
		var options = module.exports.getMessageTypes();
		
		return module.exports.getTypeMessages(request, options); 
	}
};