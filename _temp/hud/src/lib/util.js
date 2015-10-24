'use strict';

var $ = require('$jquery');

var camelCaseRegEx = /^([A-Z])|[\s-_](\w)/g;
var currentRequestId = function() {
    return document.getElementById('__glimpse_hud').getAttribute('data-request-id');
};
var usedMessageTypes = function() {
    return 'environment,user-identification,end-request,begin-request,after-action-invoked,after-action-view-invoked,after-execute-command';
}
    
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
    resolveClientUrl: function() {
        return '/glimpse/client/index.html?hash=bf90859f&requestId=' + currentRequestId();
    },
    resolveContextUrl: function() {
        return '/glimpse/context/?contextId=' + currentRequestId() + '&types=' + usedMessageTypes();
    }
};