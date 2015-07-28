'use strict';

var helper = require('./request-converter-helper');

module.exports = function(request, message) { 
    return helper.copyProperties(message.indices, request);
};