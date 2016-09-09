'use strict';

var $ = require('$jquery');

var rendering = require('./util/rendering');
var process = require('./util/process');
var util = require('lib/util');

var count = 0;
var ready = false;
var preRenderCache = [];
var summaryStack = [];
var detailStack = [];
var structure = {
    title: 'Ajax',
    id: 'ajax',
    color: '#559fdf',
    popup: {
        suppress: true,
        render: function(details) {
            var html = '<div class="glimpse-hud-popup-header">Ajax Requests</div>';
            html += '<div>' + rendering.item(structure.layout.popup.requests, details) + '</div>';
            html += '<div class="glimpse-hud-popup-clear"></div>';
            html += '<table style="table-layout:fixed;" class="glimpse-hud-listing glimpse-data-ajax-detail"><thead><tr><th class="glimpse-data-content-method"></th><th></th><th class="glimpse-hud-listing-value glimpse-data-duration">duration (ms)</th><th class="glimpse-hud-listing-value glimpse-data-size">size (kb)</th></tr></thead>';
            html += '</table>';

            return html;
        }
    },
    defaults: {
        requests: { title: 'Count', id: 'glimpse-data-ajax-count', description: 'Total Ajax requests detected on this page', visible: true, size: 1, position: 0, align: 0, getData: function(details) { return 0; } }
    },
    layout: {
        mini: {
            requests: { }
        },
        popup: {
            requests: { title: 'Total Ajax Requests', size: 0, position: 1, align: 1 }
        }
    }
};

var processContentType = function(type) {
    return type ? type.substring(0, type.indexOf(';')) : '--';
};
var processSize = function(size) {
    return size ? (Math.round((size / 1024) * 10) / 10) : '--';
}
var update = function(method, uri, duration, size, status, statusText, time, contentType, requestId) {
    //Add it when needed
    if (count == 0) {
        var section = $('.glimpse-hud-section-ajax');
        section.find('.glimpse-hud-section-inner').append('<div class="glimpse-hud-detail glimpse-hud-detail-small glimpse-hud-listing glimpse-data-ajax-summary"></div>');
        section.append(rendering.popup(structure, { }));

        section.find('.glimpse-data-ajax-detail').on('click', '.glimpse-ajax-link', function () {
            window.open(util.resolveClientUrl($(this).attr('data-requestId')), 'GlimpseClient');
        });
    }

    //Set the counter
    var counter = $('.glimpse-data-ajax-count .glimpse-hud-data').text(++count).addClass('glimpse-hud-value-update');
    setTimeout(function() {
        counter.removeClass('glimpse-hud-value-update');
    }, 2000);

    //Update data records
    var rowClass = (status == 304 ? ' glimpse-hud-quite' : !(status >= 200 && status < 300) ? ' glimpse-hud-error' : '');

    //Build the rows that we are inserting
    uri = util.htmlEncode(uri);

    var clickableUri = uri;
    if(requestId) {
        clickableUri = '<a href="javascript:void(0)" class="glimpse-ajax-link" data-requestId="' + requestId + '">' + uri + '</a>';
    }

    recordItem('<div class="glimpse-hud-listing-row glimpse-hud-value' + rowClass + '"><div class="glimpse-hud-data glimpse-hud-quite glimpse-data-ajax-method">' + method + '</div><div class="glimpse-hud-data glimpse-hud-listing-overflow glimpse-data-ajax-uri" title="' + uri + '">' + uri + '</div><div class="glimpse-data-ajax-duration"><span class="glimpse-hud-data">' + duration + '</span><span class="glimpse-hud-postfix">ms</span></div></div>', '.glimpse-hud-section-ajax .glimpse-data-ajax-summary', summaryStack, 2);
    recordItem('<tbody class="' + rowClass + '"><tr><td class="glimpse-hud-listing-overflow" title="' + uri + '" colspan="2">' + clickableUri + '</td><td class="glimpse-hud-listing-value glimpse-data-duration">' + duration + '</td><td class="glimpse-hud-listing-value glimpse-data-size">' + processSize(size) + '</td></tr><tr><td class="glimpse-hud-quite glimpse-data-content-method">' + method + '</td><td class="glimpse-hud-quite glimpse-hud-listing-overflow">' + status + ' - ' + statusText + '</td><td class="glimpse-hud-quite glimpse-data-content-type glimpse-hud-listing-overflow" title="' + contentType + '">' + processContentType(contentType) + '</td><td class="glimpse-hud-quite glimpse-data-content-time">' + time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") + '</td></tr></tbody>', '.glimpse-hud-section-ajax .glimpse-data-ajax-detail', detailStack, 6);
};
var recordItem = function(html, selector, stack, length) {
    //Set row
    var row = $(html).prependTo(selector);
    setTimeout(function() {
        row.addClass('added');
    }, 1);

    //Track state of the details
    if (stack.length >= length)
        stack.shift().remove();
    stack.push(row);
};

var render = function(details, opened) {
    process.init(structure);

    return rendering.section(structure, details, opened);
};
var postRender = function() {
    ready = true;

    preRenderCache.forEach(function(task) {
        task();
    });
    preRenderCache = undefined;
};

function listenerNotification(method, uri, startTime, xhrObj) {
    update(method, uri, new Date().getTime() - startTime, xhrObj.getResponseHeader('Content-Length'), xhrObj.status, xhrObj.statusText, new Date(), xhrObj.getResponseHeader('Content-Type'), xhrObj.getResponseHeader('X-Glimpse-ContextId'));
}
function registerListeners() {
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, uri) {
        if (util.isLocalUri(uri) && uri.indexOf('/glimpse/') == -1) {
            this._uri = uri;

            var startTime = new Date().getTime();
            this.addEventListener('readystatechange', function() {
                    if (this.readyState == 4 && this.getResponseHeader('X-Glimpse-ContextId')) {
                        // if we can render the data do so, otherwise save for later
                        if (ready) {
                            listenerNotification(method, uri, startTime, this);
                        }
                        else {
                            preRenderCache.push(function() {
                                listenerNotification(method, uri, startTime, this);
                            })
                        }
                    }
                }, false);
        }

        open.apply(this, arguments);
    };

    var send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
        if (this._uri){
            this.setRequestHeader('X-Glimpse-IsAjax', true);
        }

        send.apply(this, arguments);
    };
}

module.exports = {
    render: render,
    postRender: postRender
};

// TODO: Need to come up with a better self registration process
(function () {
    var section = require('sections/section');

    section.register(module.exports);

    registerListeners();
})();