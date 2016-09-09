'use strict';

var $ = require('$jquery');

var camelCaseRegEx = /^([A-Z])|[\s-_](\w)/g;
var usedMessageTypes = function() {
    return 'environment,user-identification,web-response,web-request,after-action-invoked,after-action-view-invoked,before-execute-command,after-execute-command,after-view-component';
}
var hudScriptElement = document.getElementById('__glimpse_hud');

module.exports = {
    localStorage: function (key, value) {
        if (arguments.length == 1) {
            return JSON.parse(localStorage.getItem(key));
        }
        localStorage.setItem(key, JSON.stringify(value));
    },
    toCamelCase: function(value) {
        return value.replace(camelCaseRegEx, function(match, p1, p2, offset) {
            if (p2) {
                return p2.toUpperCase();
            }
            return p1.toLowerCase();
        });
    },
    currentRequestId: function() {
        return hudScriptElement.getAttribute('data-request-id');
    },
    resolveClientUrl: function(requestId, follow) {
        var clientTemplate = hudScriptElement.getAttribute('data-client-template');

        var params = '&requestId=' + requestId;
        params += '&metadataUri=' + encodeURIComponent(hudScriptElement.getAttribute('data-metadata-template')); // This happens to be fully resolved already
        params += follow ? '&follow=true' : '';

        return clientTemplate.replace('{&requestId,follow,metadataUri}', params); // TODO: This should probably be resolved with a URI Template library
    },
    resolveContextUrl: function(requestId) {
        var contextTemplate = hudScriptElement.getAttribute('data-context-template');

        var params = requestId + '&types=' + usedMessageTypes()

        var uri = contextTemplate.replace('{contextId}{&types}', params); // TODO: This should probably be resolved with a URI Template library
        return encodeURI(uri);
    },
    isLocalUri: function(uri) {
        return uri && (!(uri.indexOf('http://') == 0 || uri.indexOf('https://') == 0 || uri.indexOf('//') == 0) || 
                (uri.substring(uri.indexOf('//') + 2, uri.length) + '/').indexOf(window.location.host + '/') == 0);
    },
    htmlEncode: function (value) {
        return !(value == null) ? value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
    }
};