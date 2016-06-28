'use strict';

var _ = require('lodash');
var parse = require('url-parse');
var glimpse = require('glimpse');

var _strategies = []; 

var getContentTypeCategory = (function() {
    var listing = {
        'text/html':                   {'document': true, 'highlight': 'xml'},
        'text/plain':                  {'document': true},
        'application/xhtml+xml':       {'document': true, 'highlight': 'xml'},
        'text/xml':                    {'data': true, 'highlight': 'xml'},
        'application/json':            {'data': true, 'highlight': 'json'},
        'text/css':                    {'stylesheet': true, 'highlight': 'css'},
        'text/xsl':                    {'stylesheet': true, 'highlight': 'xml'},
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
        'text/javascript':             {'script': true, 'highlight': 'javascript'},
        'text/ecmascript':             {'script': true, 'highlight': 'javascript'},
        'application/javascript':      {'script': true, 'highlight': 'javascript'},
        'application/ecmascript':      {'script': true, 'highlight': 'javascript'},
        'application/x-javascript':    {'script': true, 'highlight': 'javascript'},
        'text/javascript1.1':          {'script': true, 'highlight': 'javascript'},
        'text/javascript1.2':          {'script': true, 'highlight': 'javascript'},
        'text/javascript1.3':          {'script': true, 'highlight': 'javascript'},
        'text/jscript':                {'script': true, 'highlight': 'javascript'},
        'text/livescript':             {'script': true, 'highlight': 'livescript'},
        'text/vtt':                    {'texttrack': true},
    };
    
    return function(contentType) {
        if (contentType) {
            var target = '';
            for (var i = 0; i < contentType.length; i++) {
                var char = contentType[i];
                if (char == ';') {
                    break;
                }
                target += char
            }
            
            return listing[target];
        }
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
})();
var modifyPayload = (function() {
    // TODO: need to work out what we are doing with derived data, etc...
    //       should this be a message strategy or should we support message vs type
    //       strategies. Do i need to promote these index strategies above others..
    return {
        deriveProperties: function(request, type, payload) {
            if (type == 'web-request' || type == 'data-http-request') {
                var url = parse(payload.url);
                payload.path = url.pathname;
                payload.query = url.query;
            }
            else if (type == 'web-response' || type == 'data-http-response') {
                var contentType = payload.headers && glimpse.util.getPropertyCaseInsensitive(payload.headers, 'Content-Type');;
                payload.contentType = contentType;
                payload.statusText = getStatusCodeText(payload.statusCode);  
                payload.contentCategory = getContentTypeCategory(payload.contentType);
            }
        },
        setupIndex: function(request, type, payload) {
            if (type == 'web-request') {
                request._requestStartTime = payload.startTime;
                request._requestMethod = payload.method;
                request._requestUrl = payload.path + payload.query;
                request._requestIsAjax = payload.requestIsAjax;
            }
            else if (type == 'web-response') {
                request._responseStatusCode = payload.statusCode; 
                request._responseStatusText = payload.statusText;
                request._responseContentType = payload.contentType;
                request._responseContentCategory = payload.contentCategory;  
            }
            else if (type == 'web-response') {
                request._userId = payload.userId;
            }
        }
    };
})();

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
                    // TODO: hack, find better way to do this
                    modifyPayload.deriveProperties(request, type, message.payload);
                        
                    if (!request.types[type]) {
                        request.types[type] = [];
                        
                        // TODO: hack, find better way to do this
                        modifyPayload.setupIndex(request, type, message.payload);
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
    },
    getContentTypeCategory: getContentTypeCategory
};

// TODO: Need to come up with a better self registration process
(function() {
    var registerStrategy = module.exports.registerStrategy;
    
    // NOTE: Removing for the time being... doesn't looks like this will be needed
    // TODO: Check if this can be removed
    registerStrategy(require('./request-converter-strategy-tab___TEMP'));
    registerStrategy(require('./request-converter-strategy-tab-message___TEMP'));
})();
