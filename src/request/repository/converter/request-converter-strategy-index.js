'use strict';

var helper = require('./request-converter-helper');

var setIndex = function(message, key, value) {
    if (!message.indices) {
        message.indices = {};
    }
    
    message.indices[key] = value;
}

module.exports = function(request, message) { 
    //TEMP CODE TO GET WORKING WITH SERVER
    if (message.types) {
        message.type = message.types.join(', ');
        
        if (message.types[0] == 'begin-request-message') {
            setIndex(message, 'url', message.payload.url);
            setIndex(message, 'id', message.context.id);
        }
        
        if (message.types[0] == 'end-request-message') {
            setIndex(message, 'duration', message.payload.duration);
            setIndex(message, 'method', message.payload.method);
            setIndex(message, 'contentType', message.payload.contentType);
            setIndex(message, 'statusCode', message.payload.statusCode);
            setIndex(message, 'dateTime', message.payload.startTime);
        }
        
        if (message.types[0] == 'user-identification') {
            var user = { 
                id: message.payload.userId, 
                name: message.payload.username, 
                avatarUrl: message.payload.image };
                
            setIndex(message, 'user', user);
        }
    }
    //TEMP CODE TO GET WORKING WITH SERVER
    
    return helper.copyProperties(message.indices, request);
};