'use strict';

var rendering = require('./util/rendering');
var process = require('./util/process');

var structure = {
	title: 'HTTP',
	id: 'http', 
	color: '#e2875e',
	popup: {
		render: function(details) {
			var requestDetails = details.request.data,
				html = '<div class="glimpse-hud-popup-header">Browser Request</div>';
			html += '<div><div class="glimpse-hud-summary-left">' + rendering.item(structure.layout.popup.request, details) + '</div>';
			html += '<table class="glimpse-hud-summary glimpse-hud-summary-right"><tr><td width="1" class="glimpse-hud-listing-overflow">' + rendering.item(structure.layout.popup.host, details) + '</td></tr><tr><td class="glimpse-hud-listing-overflow">' + rendering.item(structure.layout.popup.principal, details)  + '</td></tr></table></div>';
			html += '<div class="glimpse-hud-popup-clear"></div>';
			html += '<div class="glimpse-data-request-parts"><table><tr><td colspan="3"><div class="glimpse-hud-bar glimpse-hud-tooltips-non"><div><div class="glimpse-hud-bar-item" style="width: 100%;background-color: ' + requestDetails.browser.categoryColor + '"></div><div class="glimpse-hud-bar-item" style="width: ' + (requestDetails.server.percentage + requestDetails.network.percentage) + '%;background-color: ' + requestDetails.server.categoryColor + ';"></div><div class="glimpse-hud-bar-item" style="width: ' + requestDetails.network.percentage + '%;background-color: ' + requestDetails.network.categoryColor + ';"></div></div></div></td></tr><tr><td class="glimpse-data-wire-part">' + rendering.item(structure.layout.popup.wire, details) + '</td><td class="glimpse-data-server-part">' + rendering.item(structure.layout.popup.server, details) + '</td><td class="glimpse-data-client-part">' + rendering.item(structure.layout.popup.client, details) + '</td></tr></table></div>'; 

			return html;
		}
	},
	defaults: {
		request: { title: 'Request', description: 'Total request time from click to dom ready', visible: true, size: 1, position: 0, align: 0, postfix: 'ms', getData: function(details) { return details.request.data.total.duration; } },
		wire: { title: 'Network', description: 'Total time on the network', visible: true, size: 2, position: 0, align: 0, postfix: 'ms', getData: function(details) { return details.request.data.network.duration; } },
		server: { title: 'Server', description: 'Total time on the server', visible: true, size: 2, position: 0, align: 0, postfix: 'ms', getData: function(details) { return details.request.data.server.duration; } },
		client: { title: 'Client', description: 'Total time once client kicks in to dom ready', visible: true, size: 2, position: 0, align: 0, postfix: 'ms', getData: function(details) { return details.request.data.browser.duration; } }, 
		host: { title: 'Host', description: 'Server that responded to the request', visible: true, size: 2, position: 1, align: 1, postfix: '', getLayoutData: function(details) { return '<div class="glimpse-hud-listing-overflow" style="max-width:170px;">' + details.environment.data.serverName + '</div>'; } }, 
		principal: { title: 'Principal', description: 'Principal that is currently logged in for this session', visible: function(details) { return details.environment.data.user; }, size: 2, position: 1, align: 1, postfix: '', getLayoutData: function(details) { return '<div class="glimpse-hud-listing-overflow" style="max-width:120px;">' + details.environment.data.user + '</div>'; } }
	},
	layout: {
		mini: {
			request: {},
			wire: {},
			server: {},
			client: {}
		},
		popup: {
			request: { title: 'Total Request Time', size: 0, position: 1, align: 1 },
			wire: { position: 1, align: 1 },
			server: { position: 1, align: 1 },
			client: { position: 1, align: 1 },
			host: { },
			principal: { }
		}
	}
};
	
var processTimings = function(details, timingsRaw) {
	var result = { },
		networkPre = calculateTimings(timingsRaw, 'navigationStart', 'requestStart'),
		networkPost = calculateTimings(timingsRaw, 'responseStart', 'responseEnd'),
		network = networkPre + networkPost,
		server = calculateTimings(timingsRaw, 'requestStart', 'responseStart'),
		browser = calculateTimings(timingsRaw, 'responseEnd', 'domComplete'),
		total = network + server + browser;
		
		console.log(timingsRaw)

	result.networkSending = { categoryColor: '#FDBF45', duration: networkPre, percentage: (networkPre / total) * 100 };
	result.networkReceiving = { categoryColor: '#FDBF45', duration: networkPost, percentage: (networkPost / total) * 100 };
	result.network = { categoryColor: '#FDBF45', duration: network, percentage: (network / total) * 100 };
	result.server = { categoryColor: '#AF78DD', duration: server, percentage: (server / total) * 100 };
	result.browser = { categoryColor: '#72A3E4', duration: browser, percentage: (browser / total) * 100 };
	result.total = { categoryColor: '#10E309', duration: network + server + browser, percentage: 100 };
	
	details.request = { data: result, name: 'Request' };
};
var calculateTimings = function(timingsRaw, startIndex, finishIndex) { 
	return timingsRaw[finishIndex] - timingsRaw[startIndex];
};
	
var render = function(details, opened) {
	var html = '';
	
	var timingsRaw = (window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance || {}).timing;
	if (timingsRaw) {
		process.init(structure);
		processTimings(details, timingsRaw); 
		html = rendering.section(structure, details, opened); 
	}

	return html;
};

module.exports = {
	render: render
};

// TODO: Need to come up with a better self registration process
(function () {
    var section = require('sections/section');

    section.register(module.exports);
})();