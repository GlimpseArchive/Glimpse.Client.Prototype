'use strict';

var rendering = require('./util/rendering');
var process = require('./util/process');
var $ = require('$jquery');

var timingsRaw = (window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance || {}).timing;
var timingIncomplete = false;

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
            html += '<div class="glimpse-data-request-parts"><table><tr><td colspan="3"><div class="glimpse-hud-bar glimpse-hud-tooltips-non"><div><div class="glimpse-hud-bar-item" style="width: 100%;background-color: ' + requestDetails.browser.categoryColor + '"></div><div class="glimpse-hud-bar-item glimpse-hud-bar-item-server" style="width: ' + (requestDetails.server.percentage + requestDetails.network.percentage) + '%;background-color: ' + requestDetails.server.categoryColor + ';"></div><div class="glimpse-hud-bar-item glimpse-hud-bar-item-network" style="width: ' + requestDetails.network.percentage + '%;background-color: ' + requestDetails.network.categoryColor + ';"></div></div></div></td></tr><tr><td class="glimpse-data-wire-part">' + rendering.item(structure.layout.popup.wire, details) + '</td><td class="glimpse-data-server-part">' + rendering.item(structure.layout.popup.server, details) + '</td><td class="glimpse-data-client-part">' + rendering.item(structure.layout.popup.client, details) + '</td></tr></table></div>'; 

            return html;
        }
    },
    defaults: {
        request: { title: 'Request', description: 'Total request time from click to dom ready', visible: true, size: 1, position: 0, align: 0, postfix: 'ms', getData: function(details) { return details.request.data.total.duration; }, id: 'glimpse-hud-data-request' },
        wire: { title: 'Network', description: 'Total time on the network', visible: true, size: 2, position: 0, align: 0, postfix: 'ms', getData: function(details) { var duration = details.request.data.network.duration; return duration === null ? '...' : duration; }, id: 'glimpse-hud-data-network' },
        server: { title: 'Server', description: 'Total time on the server', visible: true, size: 2, position: 0, align: 0, postfix: 'ms', getData: function(details) { return details.request.data.server.duration; }, id: 'glimpse-hud-data-server' },
        client: { title: 'Client', description: 'Total time in browser (to load)', visible: true, size: 2, position: 0, align: 0, postfix: 'ms', getData: function(details) { var duration = details.request.data.browser.duration; return duration === null ? '...' : duration; }, id: 'glimpse-hud-data-client' }, 
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

var calculateTimings = function(timingsRaw, startIndex, finishIndex) { 
    return timingsRaw[finishIndex] - timingsRaw[startIndex];
};
var getTimings = function(details, timingsRaw) {
    var network = calculateTimings(timingsRaw, 'responseStart', 'responseEnd') + calculateTimings(timingsRaw, 'navigationStart', 'requestStart'),
        server = calculateTimings(timingsRaw, 'requestStart', 'responseEnd'),
        browser = calculateTimings(timingsRaw, 'responseStart', 'loadEventEnd'),
        total = calculateTimings(timingsRaw, 'navigationStart', 'loadEventEnd');

    // trying to avoid negitive values showing up
    if (server <= 0) {
        server = parseInt(details.request.data.responseDuration);
    }
    if (network < 0 || browser < 0) {
        if (network < 0) {
            network = 0;
        }
        if (browser < 0) {
            browser = 0;
        }
        timingIncomplete = true;
    }
    else {
        timingIncomplete = false;
    }

    return { network: network, server: server, browser: browser, total: total };
};
var processTimings = function(details, timingsRaw) {
    var timing = getTimings(details, timingsRaw),
        result = {
            network: { categoryColor: '#FDBF45', duration: timing.network === 0 ? null : timing.network, percentage: (timing.network / timing.total) * 100 },
            server: { categoryColor: '#AF78DD', duration: timing.server, percentage: (timing.server / timing.total) * 100 },
            browser: { categoryColor: '#72A3E4', duration: timing.browser === 0 ? null : timing.browser, percentage: (timing.browser / timing.total) * 100 },
            total: { categoryColor: '#10E309', duration: timing.total, percentage: 100 }
        };

    details.request = { data: result, name: 'Request' };
};

var render = function(details, opened) {
    var html = '';

    if (timingsRaw) {
        process.init(structure);
        processTimings(details, timingsRaw);

        html = rendering.section(structure, details, opened);
    }

    return html;
};
var postRender = function(holder, details) {
    if (timingIncomplete) {
        tryUpdateBrowserData(details);
    }
};

var tryUpdateBrowserData = function(details) {
    var timing = getTimings(details, timingsRaw);
    if (timingIncomplete) {
        setTimeout(function() { tryUpdateBrowserData(details); }, 100)
    }
    else {
        updateBrowserData(details, timing);
    }
};
var updateBrowserData = function(details, timing) {
    var data = details.request.data;

    // adjust timings
    data.network.duration = timing.network;
    data.browser.duration = timing.browser;
    data.server.duration = timing.server;
    data.total.duration = timing.total;

    // adjust percentage
    data.browser.percentage = (data.browser.duration / data.total.duration) * 100;
    data.server.percentage = (data.server.duration / data.total.duration) * 100;
    data.network.percentage = (data.network.duration / data.total.duration) * 100;

    // manually update the dom
    $('.glimpse-hud-data-network .glimpse-hud-data').text(data.network.duration);
    $('.glimpse-hud-data-client .glimpse-hud-data').text(data.browser.duration);
    $('.glimpse-hud-data-server .glimpse-hud-data').text(data.server.duration);
    $('.glimpse-hud-data-request .glimpse-hud-data').text(data.total.duration);

    $('.glimpse-hud-bar-item-server').attr('style', 'background-color: ' + data.server.categoryColor + ';width:' + (data.server.percentage + data.network.percentage) + '%');
    $('.glimpse-hud-bar-item-network').attr('style', 'background-color: ' + data.network.categoryColor + ';width:' + data.network.percentage + '%');
}

module.exports = {
    render: render,
    postRender: postRender
};

// TODO: Need to come up with a better self registration process
(function () {
    var section = require('sections/section');

    section.register(module.exports);
})();
