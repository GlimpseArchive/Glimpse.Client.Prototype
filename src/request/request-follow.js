'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');
var util = require('lib/util');
var messageProcessor = require('./util/request-message-processor');

(function() {
	var deepLinkRequestId;
	var deepLinkUserId;
	var detailSubscription;
	
	var checkUrl = function() {
		var requestId = util.getQueryStringParam('requestId');
		if (requestId) {
			deepLinkRequestId = requestId;
			
			detailSubscription = glimpse.on('data.request.detail.found', foundRequestDetail);
			
			glimpse.emit('shell.request.summary.selected', { requestId: requestId })
		}
	};
	
	// NOTE: assumes that user message is going to be in detail response we get 
	var foundRequestDetail = function(foundRequest) {
		var request = foundRequest.allRequestsIndex[deepLinkRequestId];
		if (request) {
			glimpse.off(detailSubscription);
			
			var userMessage = messageProcessor.getTypeMessageItem(request, 'user-identification');
			if (userMessage) {
				deepLinkUserId = userMessage.userId;
				
				glimpse.on('data.request.summary.found', foundRequestSummary);
			}
		}
	};
	
	var foundRequestSummary = function(foundRequest) {
		_.each(foundRequest.affectedRequests, function(request) {
			var userMessage = messageProcessor.getTypeMessageItem(request, 'user-identification');
			if (userMessage && userMessage.userId == deepLinkUserId) {
				// TODO: need to some sort of check to see that this request happened after the last one
				var endMessage = messageProcessor.getTypeMessageItem(request, 'end-request');
				if (endMessage && endMessage.responseContentType && endMessage.responseContentType.indexOf('text/html') > -1) {
					glimpse.emit('shell.request.summary.selected', { requestId: request.id });
				}
			}
		});
	};
	
	glimpse.on('shell.request.ready', checkUrl);
})();