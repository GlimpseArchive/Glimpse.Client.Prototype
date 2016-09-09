'use strict';

var $ = require('$jquery');
var chance = require('../../../fake/fake-extension'); 

$.getJSON = function(url, data, callback) {
    // TODO: turn into a strategy latere on if needed
    if (url == '/glimpse/context/?contextId=1234&types=environment,user-identification,web-response,web-request,after-action-invoked,after-action-view-invoked,before-execute-command,after-execute-command,after-view-component') {
        setTimeout(function() {
            callback(chance.mvcRequest(new Date()).messages);
        }, 1000);
    }
}