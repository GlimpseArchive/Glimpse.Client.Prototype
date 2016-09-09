'use strict';

var $ = require('$jquery');

var rendering = require('./util/rendering');
var process = require('./util/process');

var getTimeValue = function(value) {
    return value < 1 ? '<span class="glimpse-hud-prefix-super">&lt;</span>1' : value;
};

var structure = {
    title: 'Host',
    id: 'host',
    color: '#6161e0',
    popup: {
        render: function(details) {
            var hasTrivial = false,
                html = '<div class="glimpse-hud-popup-header">Server Side</div>';
            html += '<div><div style="position: absolute; right: 0; margin-right: 16px;">' + rendering.item(structure.layout.popup.time, details) + '</div><table class="glimpse-hud-summary glimpse-hud-summary-space glimpse-hud-summary-left"><tr><th>' + (rendering.item(structure.layout.popup.action, details) || rendering.item(structure.layout.popup.loading, details)) + '</th></tr><tr><td>' + (rendering.item(structure.layout.popup.controller, details) || rendering.item(structure.layout.popup.viewStateSize, details)) + '</td></tr></table>';
            html += '<table class="glimpse-hud-summary glimpse-hud-summary-space glimpse-hud-summary-right"><tr><td width="1">' + (rendering.item(structure.layout.popup.view, details) || rendering.item(structure.layout.popup.rendering, details)) + '</td>' + (details.sql ? '<td width="60"></td><td>' + rendering.item(structure.layout.popup.queries, details) + '</td>' : '') + '</tr><tr><td>' + rendering.item(structure.layout.popup.server, details) + '</td>' + (details.sql ? '<td></td><td>' + rendering.item(structure.layout.popup.connections, details) + '</td>' : '') + '</tr></table></div>';
            html += '<div class="glimpse-hud-popup-clear"></div>'; 
            html += '<table class="glimpse-hud-listing" style="table-layout:fixed;"><thead><tr><th></th><th class="glimpse-hud-listing-value glimpse-data-childless-duration">duration (ms)</th><th class="glimpse-hud-listing-value glimpse-data-childless-start-point">from start (ms)</th></tr></thead>';  
            for (var i = 0; i < details.timings.data.length; i++) {
                var item = details.timings.data[i],
                    isTrivial = false;
                    // TODO: need to put this back in at some point
                    //isTrivial = item.duration < 2;

                if (!item.suppress) {
                    var maxLength = (16 + (details.sql ? 10 : 0)) - item.nesting * 2;

                    var rowClass = '';
                    if (item.id || isTrivial) {
                        rowClass = ' class="' + (item.id ? item.id : '' ) + (isTrivial ? ' glimpse-hud-quite' : '') + '"';
                    }

                    html += '<tbody' + (isTrivial ? ' class="glimpse-data-trivial"' : '') + '>';
                    html += '<tr' + rowClass + '><td class="glimpse-hud-listing-overflow" style="padding-left:' + (item.nesting * 15) + 'px;" ' + (item.description.length > maxLength ? 'title="' + item.description + '"' : '') +'>' + item.description + '</td><td class="glimpse-hud-listing-value glimpse-data-childless-duration glimpse-hud-data">' + item.duration + '</td><td class="glimpse-hud-listing-value glimpse-data-childless-start-point"><span class="glimpse-hud-prefix">+</span>' + item.startPoint + '</td></tr>';
                    if (item.queries && item.queries.listing.length > 0) {
                        html += '<tr><td class="glimpse-data-query-summary" style="padding-left:' + ((item.nesting * 15) + 20) + 'px;"><span class="glimpse-hud-prefix">➥</span><span class="glimpse-hud-listing-value">' + item.queries.listing.length + '</span><span class="glimpse-hud-postfix">' + (item.queries.listing.length == 1 ? 'query' : 'queries') + '</span> <span class="glimpse-hud-listing-value">' + item.queries.durationSum.toFixed(2) + '</span><span class="glimpse-hud-postfix">ms</span></td><td></td><td></td></tr>';
                    }
                    html += '</tbody>';
                    if (isTrivial) { hasTrivial = true; }
                }
            }
            html += '</table>';
            if (hasTrivial) {
                html += '<div class="glimpse-hud-controls"><span class="glimpse-control-trivial">Show Trivial</span><span class="glimpse-control-trivial" style="display:none">Hide Trivial</span></div>';
            }

            return html;
        }
    },
    defaults: {
        server: { title: 'Server Time', description: 'Total time on the server', visible: function(details) { return details.request; }, size: 1, position: 1, align: 1, postfix: 'ms', getData: function (details) { return details.request.data.server.duration; }, id: 'glimpse-hud-data-server' },
        action: { title: 'Action', description: 'How long root Action took to execute', visible: function(details) { return details.mvc && details.mvc.data && details.mvc.data.actionExecutionTime != null; }, size: 1, position: 0, align: 0, postfix: 'ms', getData: function(details) { return getTimeValue(parseInt(details.mvc.data.actionExecutionTime)); } },
        view: { title: 'View', description: 'How long root View took to render', visible: function(details) { return details.mvc && details.mvc.data && details.mvc.data.viewRenderTime != null; }, size: 1, position: 0, align: 0, postfix: 'ms', getData: function(details) { return getTimeValue(parseInt(details.mvc.data.viewRenderTime)); } },
        controller: { title: 'Controller/Action', description: 'Name of the root Controller and Action', visible: function(details) { return details.mvc && details.mvc.data; }, size: 2, position: 0, align: 0, postfix: 'ms', getLayoutData: function(details) { return '<span class="glimpse-hud-data">' + details.mvc.data.controllerName + '</span><span class="glimpse-hud-plain">.</span><span class="glimpse-hud-data">' + details.mvc.data.actionName + '</span><span class="glimpse-hud-plain">(...)</span>'; } },
        queries: { title: 'DB Queries', description: 'Total query duration and number of all SQL queries', visible: function(details) { return details.sql && details.sql.data; }, size: 1, position: 0, align: 0, getLayoutData: function(details) { return '<span class="glimpse-hud-data">' + parseInt(details.sql.data.queryExecutionTime) + '</span><span class="glimpse-hud-postfix">ms</span><span class="glimpse-hud-spacer">/</span><span class="glimpse-hud-data">'  + details.sql.data.queryCount + '</span>'; } },
        connections: { title: 'DB Connections', description: 'Total connection open time and number of all SQL connections used', visible: function (details) { return details.sql && details.sql.data && details.sql.data.connectionCount; }, size: 1, position: 1, align: 1, getLayoutData: function (details) { return '<span class="glimpse-hud-data">' + parseInt(details.sql.data.connectionOpenTime) + '</span><span class="glimpse-hud-postfix">ms</span><span class="glimpse-hud-spacer">/</span><span class="glimpse-hud-data">' + details.sql.data.connectionCount + '</span>'; } },
        time: { title: 'Server Time', description: 'Time on the server', visible: function (details) { return details.environment && details.environment.data; }, size: 4, position: 2, align: 1, getLayoutData: function (details) { var diff = parseInt((new Date(details.environment.data.serverTime + ' ' + details.environment.data.serverTimezoneOffset) - new Date()) / 1000 / 60 / 60); return '<span class="glimpse-hud-data">' + details.environment.data.serverTime + '</span> <span class="glimpse-hud-prefix" title="Coordinated Universal Time">UTC</span><span class="glimpse-hud-data">' + details.environment.data.serverTimezoneOffset + '</span> ' + (details.environment.data.serverDaylightSavingTime ? ' <span class="glimpse-hud-plain">(</span><span class="glimpse-hud-data">w/DLS</span><span class="glimpse-hud-plain">)</span>' : '') + (diff ? '<span class="glimpse-hud-spacer"> </span><span title="Time difference between server and client"><span class="glimpse-hud-prefix">Δ</span><span class="glimpse-hud-data glimpse-hud-data-important">' + (diff > 0 ? '+' : '') + diff + '</span></span>' : ''); } },
        viewStateSize: { title: 'ViewState', description: 'Size of your page ViewState', visible: function (details) { return details.webforms && details.webforms.data; }, size: 1, position: 0, align: 0, postfix: 'bytes', getData: function (details) { var viewstate; return (viewstate = $('#__VIEWSTATE').val()) ? viewstate.length : 0; } },
        loading: { title: 'Load', description: 'Time between Begin PreLoad and End LoadComplete', visible: function (details) { return details.webforms && details.webforms.data && details.webforms.data.loadingTime != null; }, size: 1, position: 0, align: 0, postfix: 'ms', getData: function (details) { return parseInt(details.webforms.data.loadingTime); } },
        rendering: { title: 'Render', description: 'Time between Begin PreRender and End Render (including SaveState events)', visible: function (details) { return details.webforms && details.webforms.data && details.webforms.data.renderingTime != null; }, size: 1, position: 0, align: 0, postfix: 'ms', getData: function (details) { return parseInt(details.webforms.data.renderingTime); } },
    },
    layout: {
        mini: {
            action: {},
            view: {},
            controller: {},
            loading: {},
            rendering: {},
            viewStateSize: {},
            queries: {}
        },
        popup: {
            server: {},
            action: { title: 'Total Action Time', position: 1, align: 1, size: 0 },
            view: { title: 'Render View', position: 1, align: 1 },
            controller: { position: 1, align: 1 },
            queries: { position: 1, align: 1 },
            connections: {},
            time: {},
            viewStateSize: { title: 'ViewState Size', position: 1, align: 1, size: 2 },
            loading: { title: 'Total Loading Time', position: 1, align: 1, size: 0 },
            rendering: { title: 'Rendering Page', position: 1, align: 1 }
        }
    }
};

var processEvents = function(details) {
    var eventStack = [],
        lastEvent = { startPoint : 0, duration : 0, childlessDuration : 0, endPoint : 0 },
        lastControllerEvent = { },
        rootDuration = details.request ? details.request.data.server.duration : 1,
        rootChildlessDuration = rootDuration;

    details.timings.data.unshift({
        category: 'Request',
        title: 'Request: ' + (window.location.pathname + window.location.search),
        duration: rootDuration,
        startPoint: 0,
        startTime: 'NOT SURE',
        id: 'glimpse-hud-data-server'
    });

    for (var i = 0; i < details.timings.data.length; i += 1) {
        var event = details.timings.data[i],
            topEvent = eventStack.length > 0 ? eventStack[eventStack.length - 1] : null, 
            left = (event.startPoint / rootDuration) * 100,
            width = (event.duration / rootDuration) * 100,
            stackParsed = false;

        event.endPoint = parseFloat((event.startPoint + event.duration).toFixed(2));

        //Work out how queries are to be parsed
        if (event.category == "Controller" || event.category == "Request" || event.category == "Webforms") {
            lastControllerEvent = event;
            lastControllerEvent.queries = { durationSum: 0, listing: [] };
        }
        else if (event.category == "Command" && lastControllerEvent.queries) { 
            lastControllerEvent.queries.listing.push(event);
            lastControllerEvent.queries.durationSum += event.duration;
            event.suppress = true;
        }

        //Derive event nesting
        while (!stackParsed) {
            if (event.startPoint > lastEvent.startPoint && event.endPoint <= lastEvent.endPoint) { 
                eventStack.push(lastEvent);
                stackParsed = true;
            }
            else if (topEvent != null && topEvent.endPoint < event.endPoint) {
                eventStack.pop();
                topEvent = eventStack.length > 0 ? eventStack[eventStack.length - 1] : null; 
                stackParsed = false;
            }
            else
                stackParsed = true;
        }

        //Work out childless timings
        var temp = eventStack.length > 0 ? eventStack[eventStack.length - 1] : undefined; 
        if (temp) {
            temp.childlessDuration = parseFloat((temp.childlessDuration - event.duration).toFixed(2));
        }

        //Work out root childless timings
        if (eventStack.length == 0)
            rootChildlessDuration -= event.duration;

        //Save calculate data
        event.duration = event.duration;
        event.childlessDuration = event.duration;
        event.startPercent = left;
        event.endPercent = left + width;
        event.widthPercent = width;
        event.nesting = eventStack.length + 1;
        event.description = event.title;

        lastEvent = event;
    }
};

var render = function(details, opened) {
    var html = '';
    //Only checking MVC/Webforms as we can't show just SQL very well
    if ((details.mvc && details.mvc.data) || (details.webforms && details.webforms.data)) {
        process.init(structure);
        processEvents(details);
        html = rendering.section(structure, details, opened);
    }

    return html;
};
var postRender = function() {
    $('.glimpse-hud .glimpse-control-trivial').click(function() { $('.glimpse-hud .glimpse-control-trivial, .glimpse-hud .glimpse-data-trivial').toggle(); });
};

module.exports = {
    render: render,
    postRender: postRender
};

// TODO: Need to come up with a better self registration process
(function () {
    var section = require('sections/section');

    section.register(module.exports);
})();