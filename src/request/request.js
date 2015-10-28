'use strict';

var glimpse = require('glimpse');
var util = require('lib/util');
var requestRepository = require('./repository/request-repository');
var userRepository = require('./repository/user-repository');

function initialize() { 
    requestRepository.triggerGetLastestSummaries();
    userRepository.triggerGetLastestUsers(); 

    glimpse.emit('shell.request.ready', {});
    
    // TODO: This should probably not be here
    var requestId = util.getQueryStringParam('requestId');
    if (requestId) {
        glimpse.emit('shell.request.summary.selected', { requestId: requestId })
    }
}

glimpse.on('shell.ready', initialize);
