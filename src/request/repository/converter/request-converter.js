'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');

var _strategies = []; 

var getContentTypeCategory = (function() {
    var listing = {
        'text/html':                   {'document': true},
        'text/xml':                    {'document': true},
        'text/plain':                  {'document': true},
        'application/xhtml+xml':       {'document': true},
        'text/css':                    {'stylesheet': true},
        'text/xsl':                    {'stylesheet': true},
        'image/jpg':                   {'image': true},
        'image/jpeg':                  {'image': true},
        'image/pjpeg':                 {'image': true},
        'image/png':                   {'image': true},
        'image/gif':                   {'image': true},
        'image/bmp':                   {'image': true},
        'image/svg+xml':               {'image': true, 'font': true, 'document': true},
        'image/vnd.microsoft.icon':    {'image': true},
        'image/webp':                  {'image': true},
        'image/x-icon':                {'image': true},
        'image/x-xbitmap':             {'image': true},
        'font/ttf':                    {'font': true},
        'font/otf':                    {'font': true},
        'font/woff':                   {'font': true},
        'font/woff2':                  {'font': true},
        'font/truetype':               {'font': true},
        'font/opentype':               {'font': true},
        'application/octet-stream':    {'font': true, 'image': true},
        'application/font-woff':       {'font': true},
        'application/font-woff2':      {'font': true},
        'application/x-font-woff':     {'font': true},
        'application/x-font-type1':    {'font': true},
        'application/x-font-ttf':      {'font': true},
        'application/x-truetype-font': {'font': true},
        'text/javascript':             {'script': true},
        'text/ecmascript':             {'script': true},
        'application/javascript':      {'script': true},
        'application/ecmascript':      {'script': true},
        'application/x-javascript':    {'script': true},
        'application/json':            {'script': true},
        'text/javascript1.1':          {'script': true},
        'text/javascript1.2':          {'script': true},
        'text/javascript1.3':          {'script': true},
        'text/jscript':                {'script': true},
        'text/livescript':             {'script': true},
        'text/vtt':                    {'texttrack': true},
    };
    
    return function(contentType) {
        return listing[contentType];
    };
})();

var getStatusCodeText = (function() {
    var listing = {
        100: 'Continue',
        101: 'Switching Protocols',
        102: 'Processing',
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        207: 'Multi-Status',
        208: 'Already Reported',
        226: 'IM Used',
        300: 'Multiple Choices',
        301: 'Moved Permanentl',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        305: 'Use Proxy',
        307: 'Temporary Redirect',
        308: 'Permanent Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Payload Too Large',
        414: 'URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Range Not Satisfiable',
        417: 'Expectation Failed',
        421: 'Misdirected Request',
        422: 'Unprocessable Entity',
        423: 'Locked',
        424: 'Failed Dependency',
        425: 'Unassigned',
        426: 'Upgrade Required',
        427: 'Unassigned',
        428: 'Precondition Required',
        429: 'Too Many Requests',
        430: 'Unassigned',
        431: 'Request Header Fields Too Large',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported',
        506: 'Variant Also Negotiates',
        507: 'Insufficient Storage',
        508: 'Loop Detected',
        509: 'Unassigned',
        510: 'Not Extended',
        511: 'Network Authentication Required'
    };
    
    return function(statusCode) {
        return listing[statusCode];
    };
});
var setupIndex = function(request, type, payload) {
    if (type == 'begin-request') {
        request._requestStartTime = payload.requestStartTime;
        request._requestMethod = payload.requestMethod;
        request._requestUrl = payload.requestPath + payload.requestQueryString;
    }
    if (type == 'end-request') {
        request._responseStatusCode = payload.responseStatusCode; 
        request._responseStatusText = getStatusCodeText(payload.responseStatusCode);
        request._responseContentType = getContentTypeCategory(payload.responseContentType);        
    }
}

module.exports = { 
    registerStrategy: function(strategy) {
        _strategies.push(strategy);

        glimpse.emit('system.request.converter.strategy.added', { strategy: strategy });
    },
    createRequest: function(requestId) {
        return {
            id: requestId,
            messages: {}
        };
    },
    convertMessages: function(request, messages) {
        var didUpdate = false;
        
        // setup the type index
        if (!request.types) {
            request.types = {};
        }      
        
        _.forEach(messages, function(message) {  
            if (!request.messages[message.id]) {
                // copy across the messages into the message index 
                request.messages[message.id] = message; 
                
                // copy across the messages into the type index
                _.forEach(message.types, function(type) {
                    if (!request.types[type]) {
                        request.types[type] = [];
                        
                        // hack because we commonly use datatime in sorting and its expensive to get
                        setupIndex(request, type, message.payload);
                    }
                    
                    request.types[type].push(message.id);
                });

                // run through the registered providers
                _.forEach(_strategies, function(action) { 
                    action(request, message) || didUpdate; 
                }); 
                
                didUpdate = true;
            } 
        });  
        
        return didUpdate;
    }
};

// TODO: Need to come up with a better self registration process
(function() {
    var registerStrategy = module.exports.registerStrategy;
    
    // NOTE: Removing for the time being... doesn't looks like this will be needed
    // TODO: Check if this can be removed
    registerStrategy(require('./request-converter-strategy-tab___TEMP'));
    registerStrategy(require('./request-converter-strategy-tab-message___TEMP'));
})();
