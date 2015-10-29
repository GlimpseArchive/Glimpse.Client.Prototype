'use strict';

var $ = require('$jquery');
var util = require('lib/util');
var messageProcessor = require('./util/request-message-processor');

var process = (function() {
	var getIndex = function(messages) {
		var index = {}
		for (var i = 0; i < messages.length; i++) {
			var message = messages[i];
			for (var x = 0; x < message.types.length; x++) {
				var type = message.types[x];
				if (!index[type]) {
					index[type] = [];
				}
				index[type].push(message);
			}
		}
		
		return index;
	};
	var getPayload = function(index) {
		var processItem = messageProcessor.getTypePayloadItem;
		var processList = messageProcessor.getTypePayloadList;
		
		return messageProcessor.getTypePayloads(index, {
			'begin-request': processItem,
			'environment': processItem,
			'user-identification': processItem,
			//'browser-navigation-timing': processItem,
			'after-action-invoked': processItem,
			'after-action-view-invoked': processItem,
			'after-execute-command': processList,
			'end-request': processItem
		});
	}
	
 	var getModel = (function() {
		var add = function(model, item, name) {
			model[name] = {
				'data': item,
				'name': name	
			};
		}
		
		var strategies = {
			environment: function(payload) {
				var environment = payload.environment || {};
				var userIdentification = payload.userIdentification || {};
				
				var result = {};
				result.serverName = environment.serverName;
				result.serverTime = environment.serverTime;
				result.serverTimezoneOffset = environment.serverTimezoneOffset;
				result.serverDaylightSavingTime = environment.serverDaylightSavingTime;
				result.user = userIdentification.username;
				
				return result;
			},
			mvc: function(payload) {
				var afterActionInvoked = payload.afterActionInvoked || {};
				var afterActionViewInvoked = payload.afterActionViewInvoked || {};
				
				var result = {};
				result.actionName = afterActionInvoked.actionName;
				result.controllerName = afterActionInvoked.actionControllerName;
				result.actionExecutionTime = afterActionInvoked.actionInvokedDuration;
				result.viewRenderTime = afterActionViewInvoked.viewDuration;
				// result.viewName = '';
				// result.childActionCount = 0;
				// result.childViewCount = 0;
				// result.matchedRouteName = 0;
				
				return result;
			},
			sql: function(payload) {
				var afterExecuteCommand = payload.afterExecuteCommand || [];
				
				var result = {};
				result.queryCount = afterExecuteCommand.length;
				// result.connectionCount = 0;
				// result.transactionCount = 0;
				// result.connectionOpenTime = 0;
				result.queryExecutionTime = 0;
				for (var i = 0; i < afterExecuteCommand.length; i++) {
					result.queryExecutionTime += afterExecuteCommand[i].commandDuration;
				}
				
				return result;
			},
			request: function(payload) { 
				var beginRequest = payload.beginRequest || {};
				var endRequest = payload.endRequest || {};
				//var browserNavigationTiming = payload.browserNavigationTiming || {};
				
				var result = {};
				result.requestMethod = beginRequest.requestMethod;
				result.requestUrl = beginRequest.requestUrl;
				result.requestPath = beginRequest.requestPath;
				result.requestQueryString = beginRequest.requestQueryString;
				result.responseContentLength = endRequest.responseContentLength;
				result.responseContentType = endRequest.responseContentType;
				result.responseStatusCode = endRequest.responseStatusCode;
				result.responseStatusText = endRequest.responseStatusText;
				result.responseDuration = endRequest.responseDuration;
				
				return result;
			},
			timings: function(payload) {
				var afterActionInvoked = payload.afterActionInvoked || {};
				var afterActionViewInvoked = payload.afterActionViewInvoked || {};
				var afterExecuteCommand = payload.afterExecuteCommand || [];
				
				var result = [];
				result.push({
					title: 'Controller: ' + afterActionInvoked.actionControllerName + '.' + afterActionInvoked.actionName,
					startTime: 'NOT SET',
					duration: afterActionInvoked.actionInvokedDuration,
					startPoint: afterActionInvoked.actionInvokedOffset,
					category: 'Controller'
				});
				result.push({
					title: 'Render: ' + afterActionInvoked.actionControllerName + '.' + afterActionInvoked.actionName,
					startTime: 'NOT SET',
					duration: afterActionViewInvoked.viewDuration,
					startPoint: afterActionViewInvoked.viewOffset,
					category: 'View'
				});
				for (var i = 0; i < afterExecuteCommand.length; i++) {
					var command = afterExecuteCommand[i];
					result.push({
						title: 'Command: ' + command.commandMethod,
						startTime: command.commandEndTime,
						duration: command.commandDuration,
						startPoint: command.commandOffset,
						category: 'Command'
					});
				}			
				
				return result;
			}
		};
		
		return function(payload) {
			var model = {};
			add(model, strategies.environment(payload), 'environment');
			add(model, strategies.mvc(payload), 'mvc');
			add(model, strategies.sql(payload), 'sql');
			add(model, strategies.request(payload), 'request');
			add(model, strategies.timings(payload), 'timings');
			
			return model;
		};
	})();

	return function(messages) {
		var index = getIndex(messages);
		var payload = getPayload(index);
		var model = getModel(payload);
		
		return model;
	};
})();

var getData = function(callback) {
	$.getJSON(util.resolveContextUrl(util.currentRequestId()), null, function(data) {
		var model = process(data);
		callback(model);
	});
}

module.exports = {
	getData: getData
};