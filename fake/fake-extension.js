'use strict';

var _ = require('lodash');
var moment = require('moment');
var Chance = require('chance');

var chance = new Chance();
var mvcActions = [];
var allUsers = [];
var currentUsers = [];
var methods = [ 'GET', 'GET', 'GET', 'GET', 'POST', 'POST', 'POST', 'PUT', 'PUSH', 'DELETE' ];
var statuses = [ 200, 200, 200, 200, 200, 200, 404, 404, 403, 403, 500, 304 ];
var statusText = { 200: 'OK', 404: 'NOT FOUND', 500: 'SERVER ERROR', 304: 'OK', 403: 'ERROR' };

chance.mixin({
    'integerRange': function(min, max) {
        return chance.integer({ min: min, max: max });
    },
    'durationRange': function(min, max) {
        return chance.floating({ min: min, max: max, fixed: 2 });
    },
    'dateRange': function(min, max) {
        var time = new Date().getTime();
        var difference = chance.integerRange(min, max);
        var newTime = new Date(time + difference);

        return newTime;
    },
    'mvcAction': function() {
        return _.clone(chance.pick(mvcActions), true); 
    },
    'mvcRequest': function(dateTime) {
        return generateMvcRequest(dateTime);
    },
    'mvcUser': function() {
        return _.clone(chance.pick(currentUsers), true);  
    },
    'httpPath': function() {
        return chance.pick(mvcActions).url;
    },
    'httpMethod': function() {
        return chance.pick(methods);
    },
    'httpStatus': function() {
        var code = chance.pick(statuses);
        return {
            code: code,
            text: statusText[code]
        };
    },
    'httpContentType': function() {
        // TODO: Switch over to weighted random with bias towards html
        return 'text/html';
    }
});


var mapProperties = function(source, target, properties) {
    _.forEach(properties, function(property) { 
        target[property] = source[property];
    });
    
    return target;
};

// TODO: Should be brought into a different file/module 
var seedMvcActions = (function() {
    var generate = {
        common: {
            route: function (controller, action, id) {
                return {
                    name: 'Default',
                    pattern: '{controller=home}/{action=index}/{id?}',
                    data: [
                        { tag: 'controller', match: controller, default: 'home', required: false },
                        { tag: 'action', match: action, default: 'index', required: false },
                        { tag: 'id', match: id, default: null, required: false }
                    ]
                };
            }
        },
        instance: {
            childAction: {
                shoppingCart: function() {
                    return {
                        controller: 'ShoppingCart',
                        action: 'CartSummary',
                        route: generate.common.route('shoppingcart', 'cartsummary', null),
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Carts', affected: 1, commmand: 'SELECT TOP (5) \n[Project1].[AlbumId] AS [AlbumId], \n[Project1].[GenreId] AS [GenreId], \n[Project1].[ArtistId] AS [ArtistId], \n[Project1].[Title] AS [Title], \n[Project1].[Price] AS [Price], \n[Project1].[AlbumArtUrl] AS [AlbumArtUrl]\nFROM ( SELECT \n    [Extent1].[AlbumId] AS [AlbumId], \n    [Extent1].[GenreId] AS [GenreId], \n    [Extent1].[ArtistId] AS [ArtistId], \n    [Extent1].[Title] AS [Title], \n    [Extent1].[Price] AS [Price], \n    [Extent1].[AlbumArtUrl] AS [AlbumArtUrl], \n    (SELECT \n        COUNT(1) AS [A1]\n        FROM [dbo].[OrderDetails] AS [Extent2]\n        WHERE [Extent1].[AlbumId] = [Extent2].[AlbumId]) AS [C1]\n    FROM [dbo].[Albums] AS [Extent1]\n)  AS [Project1]\nORDER BY [Project1].[C1] DESC'  }
                        ],
                        trace: [
                            { message: 'Cart has items in that the user has added.' }
                        ]
                    };
                },
                genreMenu: function() {
                    return {
                        controller: 'Store',
                        action: 'GenreMenu',
                        route: generate.common.route('store', 'genremenu', null),
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Genres', affected: 10, command: 'SELECT \n[Extent1].[GenreId] AS [GenreId], \n[Extent1].[Name] AS [Name], \n[Extent1].[Description] AS [Description]\nFROM [dbo].[Genres] AS [Extent1]' }
                        ]
                    };
                }
            },
            rootActions: {
                storeBrowse: function() {
                    var genre = chance.word();
                    
                    return {
                        url: '/Store/Browse?Genre=' + genre,
                        controller: 'Store',
                        action: 'Browse',
                        route: generate.common.route('store', 'browse', null),
                        binding: [
                            { type: 'string', name: 'Genre', value: genre }
                        ],
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Albums', affected: chance.integerRange(2, 50), command: 'SELECT \n[Project1].[GenreId] AS [GenreId], \n[Project1].[Name] AS [Name], \n[Project1].[Description] AS [Description], \n[Project1].[C1] AS [C1], \n[Project1].[AlbumId] AS [AlbumId], \n[Project1].[GenreId1] AS [GenreId1], \n[Project1].[ArtistId] AS [ArtistId], \n[Project1].[Title] AS [Title], \n[Project1].[Price] AS [Price], \n[Project1].[AlbumArtUrl] AS [AlbumArtUrl]\nFROM ( SELECT \n    [Limit1].[GenreId] AS [GenreId], \n    [Limit1].[Name] AS [Name], \n    [Limit1].[Description] AS [Description], \n    [Extent2].[AlbumId] AS [AlbumId], \n    [Extent2].[GenreId] AS [GenreId1], \n    [Extent2].[ArtistId] AS [ArtistId], \n    [Extent2].[Title] AS [Title], \n    [Extent2].[Price] AS [Price], \n    [Extent2].[AlbumArtUrl] AS [AlbumArtUrl], \n    CASE WHEN ([Extent2].[AlbumId] IS NULL) THEN CAST(NULL AS int) ELSE 1 END AS [C1]\n    FROM  (SELECT TOP (2) [Extent1].[GenreId] AS [GenreId], [Extent1].[Name] AS [Name], [Extent1].[Description] AS [Description]\n        FROM [dbo].[Genres] AS [Extent1]\n        WHERE [Extent1].[Name] = "Rock" ) AS [Limit1]\n    LEFT OUTER JOIN [dbo].[Albums] AS [Extent2] ON [Limit1].[GenreId] = [Extent2].[GenreId]\n)  AS [Project1] ORDER BY [Project1].[GenreId] ASC, [Project1].[C1] ASC' }
                        ],
                        actions: [
                            generate.instance.childAction.shoppingCart(),
                            generate.instance.childAction.genreMenu()
                        ],
                        trace: [
                            { template: { mask: 'Currently genre {0} selected', values: { '0': genre } } }
                        ]
                    };
                },
                storeDetail: function() { 
                    var id = chance.integerRange(1000, 2000);
            
                    return { 
                        url: '/Store/Details/' + id, 
                        controller: 'Store', 
                        action: 'Details',
                        route: generate.common.route('store', 'details', id),
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Albums', affected: 1, command: 'SELECT TOP (2) \n[Extent1].[AlbumId] AS [AlbumId], \n[Extent1].[GenreId] AS [GenreId], \n[Extent1].[ArtistId] AS [ArtistId], \n[Extent1].[Title] AS [Title], \n[Extent1].[Price] AS [Price], \n[Extent1].[AlbumArtUrl] AS [AlbumArtUrl]\nFROM [dbo].[Albums] AS [Extent1]\nWHERE [Extent1].[AlbumId] = 1 /* @p0 */' },
                            { access: 'SQL', operation: 'Select', target: 'Genres', affected: 1, command: 'SELECT \n[Extent1].[GenreId] AS [GenreId], \n[Extent1].[Name] AS [Name], \n[Extent1].[Description] AS [Description]\nFROM [dbo].[Genres] AS [Extent1]\nWHERE [Extent1].[GenreId] = 1 /* @EntityKeyValue1 */' },
                            { access: 'SQL', operation: 'Select', target: 'Artists', affected: 1, command: 'SELECT \n[Extent1].[ArtistId] AS [ArtistId], \n[Extent1].[Name] AS [Name]\nFROM [dbo].[Artists] AS [Extent1]\nWHERE [Extent1].[ArtistId] = 1 /* @EntityKeyValue1 */' }
                        ],
                        actions: [
                            generate.instance.childAction.shoppingCart(),
                            generate.instance.childAction.genreMenu()
                        ],
                        trace: [
                            { template: { mask: 'Currently item/detail {0} selected', values: { '0': id } } }
                        ]
                    };
                },
                home: function() {
                    return { 
                        url: '/', 
                        controller: 'Home', 
                        action: 'Index',
                        route: generate.common.route('home', 'index', null),
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Albums', affected: chance.integerRange(2, 50), command: 'SELECT TOP (5) \n[Project1].[AlbumId] AS [AlbumId], \n[Project1].[GenreId] AS [GenreId], \n[Project1].[ArtistId] AS [ArtistId], \n[Project1].[Title] AS [Title], \n[Project1].[Price] AS [Price], \n[Project1].[AlbumArtUrl] AS [AlbumArtUrl]\nFROM ( SELECT \n    [Extent1].[AlbumId] AS [AlbumId], \n    [Extent1].[GenreId] AS [GenreId], \n    [Extent1].[ArtistId] AS [ArtistId], \n    [Extent1].[Title] AS [Title], \n    [Extent1].[Price] AS [Price], \n    [Extent1].[AlbumArtUrl] AS [AlbumArtUrl], \n    (SELECT \n        COUNT(1) AS [A1]\n        FROM [dbo].[OrderDetails] AS [Extent2]\n        WHERE [Extent1].[AlbumId] = [Extent2].[AlbumId]) AS [C1]\n    FROM [dbo].[Albums] AS [Extent1]\n)  AS [Project1]\nORDER BY [Project1].[C1] DESC'  }
                        ],
                        actions: [
                            generate.instance.childAction.shoppingCart(),
                            generate.instance.childAction.genreMenu()
                        ],
                        trace: [
                            { message: 'Initial page loaded.' }
                        ] 
                    };
                },
                cart: function() {
                    return { 
                        url: '/ShoppingCart/', 
                        controller: 'ShoppingCart', 
                        action: 'Index',
                        route: generate.common.route('shoppingcart', 'index', null),
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Carts', affected: 1, command: 'SELECT \n[Extent1].[RecordId] AS [RecordId], \n[Extent1].[CartId] AS [CartId], \n[Extent1].[AlbumId] AS [AlbumId], \n[Extent1].[Count] AS [Count], \n[Extent1].[DateCreated] AS [DateCreated]\nFROM [dbo].[Carts] AS [Extent1]\nWHERE [Extent1].[CartId] = "df0238d4-5bd4-49b5-97f0-9ba2c9957dc1" /* @p__linq__0 */' },
                            { access: 'SQL', operation: 'Select', target: 'Carts', affected: 1, command: 'SELECT \n[GroupBy1].[A1] AS [C1]\nFROM ( SELECT \n    SUM([Filter1].[A1]) AS [A1]\n    FROM ( SELECT \n         CAST( [Extent1].[Count] AS decimal(19,0)) * [Extent2].[Price] AS [A1]\n        FROM  [dbo].[Carts] AS [Extent1]\n        INNER JOIN [dbo].[Albums] AS [Extent2] ON [Extent1].[AlbumId] = [Extent2].[AlbumId]\n        WHERE [Extent1].[CartId] = "df0238d4-5bd4-49b5-97f0-9ba2c9957dc1" /* @p__linq__0 */\n    )  AS [Filter1]\n)  AS [GroupBy1]' }
                        ],
                        actions: [
                            generate.instance.childAction.shoppingCart(),
                            generate.instance.childAction.genreMenu()
                        ],
                        trace: [
                            { message: 'Cart applied tax rates correctly.' },
                            { template: { mask: 'Cart tax rates processed in {0}ms', values: { '0': chance.durationRange(0, 1) } } }
                        ] 
                    };
                },
                store: function() {
                    return { 
                        url: '/Store/', 
                        controller: 'Store', 
                        action: 'Index',
                        route: generate.common.route('store', 'index', null),
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Genres', affected: 10, command: 'SELECT \n[Extent1].[GenreId] AS [GenreId], \n[Extent1].[Name] AS [Name], \n[Extent1].[Description] AS [Description]\nFROM [dbo].[Genres] AS [Extent1]' }
                        ],
                        actions: [
                            generate.instance.childAction.shoppingCart(),
                            generate.instance.childAction.genreMenu()
                        ],
                        trace: [
                            { message: 'Processing menu options for selection.' }
                        ] 
                    };
                },
                login: function() {
                    return { 
                        url: '/Account/LogIn/', 
                        controller: 'Account', 
                        action: 'LogIn',
                        route: generate.common.route('account', 'login', null),
                        actions: [
                            generate.instance.childAction.shoppingCart(),
                            generate.instance.childAction.genreMenu()
                        ],
                        trace: [
                            { template: { mask: 'User from {0} is attempting to login', values: { '0': chance.ip() } } }
                        ] 
                    };
                }
            }
        },
        meta: {
            stardardActions: [ 'home', 'cart', 'store', 'login' ]
        }
    }; 
    
    var executeSequence = function(store, instances, action) {
        for (var i = 0; i < instances; i++) {
            store.push(action());
        }
    };
     
    return function() {
        var actions = [];
        
        // go generate random actions weighting
        executeSequence(actions, chance.integerRange(5, 10), generate.instance.rootActions.storeBrowse);
        executeSequence(actions, chance.integerRange(10, 15), generate.instance.rootActions.storeDetail);
        executeSequence(actions, chance.integerRange(15, 20), function() {
                var targetName = generate.meta.stardardActions[chance.integerRange(0, generate.meta.stardardActions.length - 1)];
                return generate.instance.rootActions[targetName]();
            }); 
        
        return actions;
    };
})(); 

// TODO: Should be brought into a different file/module 
var seedUsers = function() {
    return [
        { userId: chance.guid(), username: 'Anthony', image: 'https://avatars.githubusercontent.com/u/585619' },
        { userId: chance.guid(), username: 'Nik', image: 'https://avatars.githubusercontent.com/u/199026' },
        { userId: chance.guid(), username: 'Christophe', image: 'https://avatars.githubusercontent.com/u/1467346' },
        { userId: chance.guid(), username: 'Bjorn', image: 'https://avatars.githubusercontent.com/u/1607579' },
        { userId: chance.guid(), username: 'Ian', image: 'https://avatars.githubusercontent.com/u/52329?' },
        { userId: chance.guid(), username: 'Keith', image: 'https://avatars.githubusercontent.com/u/133987?' },
        { userId: chance.guid(), username: 'Aaron', image: 'https://avatars.githubusercontent.com/u/434140?' },
        { userId: chance.guid(), username: 'Jeff', image: 'https://avatars.githubusercontent.com/u/683658?' },
        { userId: chance.guid(), username: 'Kristian', image: 'https://avatars.githubusercontent.com/u/582487?' },
        { userId: chance.guid(), username: 'James', image: 'https://avatars.githubusercontent.com/u/1197383?' }
    ];
};


// TODO: Should be brought into a different file/module
var generateMvcRequest = (function() {    
    // generate source
    var SourceGenerator = function() { 
    };
    SourceGenerator.prototype.processRequest = function(dateTime) { 
        var source = chance.mvcAction();
        
        // NOTE: now that we have cloned the this request source, need to go through 
        //       and setup the request for this instance 
        var serverLowerTime = chance.integerRange(5, 10);
        var serverUpperTime = chance.integerRange(60, 100);
        var httpStatus = chance.httpStatus();
        
        source.id = chance.guid();
        source.dateTime = dateTime || moment().utc().toISOString();
        source.networkTime = chance.integerRange(0, 15);
        source.serverTime = chance.integerRange(serverLowerTime, serverUpperTime); // TODO: Bug with these two lines
        source.actionTime = chance.integerRange(serverLowerTime - 1, source.serverTime); // TODO: Need to verify that this works
        source.viewTime = source.serverTime - source.actionTime;
        source.clientTime = chance.integerRange(20, 120);
        source.queryTime = chance.integerRange(2, Math.max(source.actionTime / 3, 3)); // TODO: derive from queries
        source.queryCount = chance.integerRange(1, 4); // TODO: derive from queries
        source.user = chance.mvcUser();
        source.method = chance.httpMethod();
        source.contentType = chance.httpContentType();
        source.duration = source.clientTime + source.serverTime + source.networkTime;
        source.statusCode = httpStatus.code;   
        source.statusText = httpStatus.text;
        source.context = { type: 'request', id: source.id };
        
        return source;  
    };
    
    // generate messages
    var MessageGenerator = function() {
        this.messages = [];
        this.counter = 0;
        this.stats = {
            queryDuration: 0,
            queryCount: 0
        };
    };
    MessageGenerator.support = {
        applyTiming: function(payload, time, offset) {
            payload.time = time;
            payload.offset = offset; 
        },
        applyDuration: function(payload, duration, time, offset) { 
            payload.duration = duration;
            
            MessageGenerator.support.applyTiming(payload, time, offset); 
        },
        childTimings: function (events, availableTime) {
            // TODO: Need to calculate offsets
            var usedTime = 0;
    
            if (events) {
                var timeParts = availableTime / (events.length * 100 * 2.5);
                var upperParts = events.length * 100;
                var lowerParts = upperParts * 0.5;
    
                for (var i = 0; i < events.length; i++) {
                    var newActivityTime = timeParts * chance.integerRange(lowerParts, upperParts);
    
                    events[i].duration = newActivityTime;
    
                    usedTime += newActivityTime;
                }
            }
    
            return usedTime;
        }
    };
    MessageGenerator.prototype = { 
        createMessage: function(type, context) {
            return {
                types:  [ type ],
                context: context,
                id: chance.guid(),
                payload: {},
                count: this.counter++
            };
        }, 
        createStart: function(source) {
            var message = this.createMessage('begin-request-message', source.context);
            message.payload = mapProperties(source, {}, [ 'url' ]);
            
            return message;
        },
        createUser: function(source) {
            var message = this.createMessage('user-identification', source.context);
            message.payload = source.user;
            
            return message;
        },
        createFramework: function(source) {
            var message = this.createMessage('request-framework', source.context);
            message.abstract = mapProperties(source, {}, [ 'networkTime', 'serverTime', 'clientTime', 'controller', 'action', 'actionTime', 'viewTime', 'queryTime', 'queryCount' ]);
            
            return message;
        },
        createEnd: function(source) {
            var message = this.createMessage('end-request-message', source.context);
            message.payload = mapProperties(source, {}, [ 'duration', 'statusCode', 'statusText', 'url', 'method', 'contentType' ]);
            
            // TODO: at some point we need to rename the fake property names 
            message.payload.startTime = source.dateTime;  
             
            return message;
        },
        createLog: function(log, context) { 
            var message = this.createMessage('request-framework-log', context);
            mapProperties(log, message.payload, [ 'template', 'message' ]);
            
            MessageGenerator.support.applyTiming(message.payload,  null, null); // TODO: need to fix offset timings
            
            return message;
        },
        createQuery: function(action, query, context) {
            var message = this.createMessage('request-framework-query', context);
            var payload = message.payload;  
            
            payload.controller = action.controller;
            payload.action = action.action
            
            mapProperties(query, payload, [ 'access', 'operation', 'target', 'affected', 'command' ]); 
            
            MessageGenerator.support.applyDuration(payload, query.duration, null, null); // TODO: need to fix offset timings
            
            this.stats.queryCount++;
            this.stats.queryDuration += query.duration;
            
            return message;
        },
        createRoute: function(action, route, context) {
            var message = this.createMessage('action-route-found-message', context);
            var payload = message.payload;  
            
            mapProperties(route, payload, [ 'name', 'pattern', 'data' ]); 
            
            payload.actionId = action.actionId; 
            
            MessageGenerator.support.applyDuration(payload, chance.durationRange(0, 1), null, null); // TODO: need to fix offset timings
        
            return message;
        },
        createFilter: function(action, targetMethod, filterType, category, origin, context) {
            var message = this.createMessage('request-framework-filter', context);
            
            var payload = message.payload;  
            payload.targetClass = action.targetClass + 'Controller';
            payload.targetMethod = targetMethod;
            payload.filterType = filterType;
            payload.category = category;
            payload.filterOrigin = origin || 'system';
            payload.controller = action.controller;
            payload.action = action.action; 
            
            MessageGenerator.support.applyDuration(payload, chance.durationRange(0, 1), null, null); // TODO: need to fix offset timings
            
            return message;
        },
        createBinding: function(action, binding, context) {
            var message = this.createMessage('action-content-processed-message', context);
            
            var payload = message.payload;  
            payload.binding = binding;
            payload.controller = action.controller;
            payload.action = action.action; 
            
            MessageGenerator.support.applyDuration(payload, chance.durationRange(0, 1), null, null); // TODO: need to fix offset timings
            
            return message; 
        },
        createAction: function(action, isPrimary, context) {
            var message = this.createMessage('request-framework-action', context);
            var payload = message.payload;   
            payload.targetClass = action.controller + 'Controller';
            payload.targetMethod = action.action;
            payload.physicalFile = 'Controller/' + action.controller + 'Controller.cs';
            payload.controller = action.controller;
            payload.action = action.action; 
            payload.isPrimary = isPrimary;
            
            MessageGenerator.support.applyDuration(payload, action.duration, null, null); // TODO: need to fix offset timings
            
            return message; 
        }, 
        createResult: function(action, result, context) {
            var message = this.createMessage('request-framework-result', context);
            var payload = message.payload;   
            payload.controller = action.controller;
            payload.action = action.action; 
            payload.provider = 'Razor'; 
            payload.physicalFile = 'View/' + action.controller + '/' + action.action + '.cshtml';
            
            //MessageGenerator.support.applyDuration(payload, result.duration, null, null); // TODO: need to fix offset timings
            
            return message; 
        },
        processAction: (function() { 
            var modifyInstance = function(action) {
                var availableTime = action.duration;
                availableTime -= MessageGenerator.support.childTimings(action.actions, availableTime, 2.5);
                availableTime -= MessageGenerator.support.childTimings(action.activities, availableTime, 1.5);  
                
                action.actionId = chance.guid();
            };
            
            return function(action, request, context) {
                modifyInstance(action);
                 
                // route
                this.messages.push(this.createRoute(action, action.route, context));
                
                // filter
                this.messages.push(this.createFilter(action, 'OnAuthorization', 'Authorization', 'Authorization', null, context));
                this.messages.push(this.createLog({ template: { mask: 'User {0} authorized to execute this action', values: { '0': request.user.name } } }, context));
                this.messages.push(this.createFilter(action, 'OnActionExecuting', 'Action', 'Executing', null, context));
                
                // action
                this.messages.push(this.createAction(action, action == request, context));
                if (action.binding) {
                    this.messages.push(this.createBinding(action, action.binding, context));
                }
                if (action.activities) {
                    _.forEach(action.activities, function(activity) {
                        this.messages.push(this.createQuery(action, activity, context));
                    }, this);
                }
                if (action.trace) {
                    _.forEach(action.trace, function(log) {
                        this.messages.push(this.createLog(log, context));
                    }, this);
                }
                
                // filter
                this.messages.push(this.createFilter(action, 'OnActionExecuted', 'Action', 'Executed', null, context));
                this.messages.push(this.createFilter(action, 'OnResultExecuting', 'Result', 'Executing', null, context));
                
                // result
                this.messages.push(this.createResult(action, action.result, context));
                
                // child actions
                if (action.actions) {
                    _.forEach(action.actions, function(childAction) {
                        this.processAction(childAction, request, context);
                    }, this);
                }
                
                // fitler
                this.messages.push(this.createFilter(action, 'OnResultExecuted', 'Result', 'Executed', null, context));
            };
        })(this),
        processRequest: function(source) {
            this.messages.push(this.createStart(source));
            this.messages.push(this.createUser(source));
            
            this.processAction(source, source, source.context);
            
            this.messages.push(this.createFramework(source));
            this.messages.push(this.createEnd(source)); 
            
            return this.messages;
        },
        modifySource: function(source) {
            source.queryTime = this.stats.queryDuration;
            source.queryCount = this.stats.queryCount;
        }
    };
    
    // generate request
    var RequestGenerator = function() { 
    };
    RequestGenerator.prototype.processRequest = function(source) {
        var request = mapProperties(source, {}, [ 'id', 'url', 'dateTime', 'method', 'contentType', 'duration', 'statusCode', 'statusText' ]);
        //request.abstract = mapProperties(source, {}, [ 'networkTime', 'serverTime', 'clientTime', 'controller', 'action', 'actionTime', 'viewTime', 'queryTime', 'queryCount' ]);
        request.messages = _.indexBy(source.messages, 'id');
        request.types = {};
        request.tabs = { 'tab.messages': { title: 'Messages', payload: source.messages } };
        
        _.forEach(request.messages, function(message) {
            _.forEach(message.types, function(type) {
                if (!request.types[type]) {
                    request.types[type] = [];
                }
                
                request.types[type].push(message.id);
            });
        });
        
        return request;
    };
    
    return function(dateTime) {
        var sourceGenerator = new SourceGenerator();
        var source = sourceGenerator.processRequest(dateTime);
        
        var messageGenerator = new MessageGenerator();
        var messages = messageGenerator.processRequest(source);
        
        source.messages = messages; 
         
        var requestGenerator = new RequestGenerator();
        var request = requestGenerator.processRequest(source);
        source.request = request;
        
        return source;
    };
})();


// TODO: when aboves are shifted this setting should be changed
mvcActions = seedMvcActions();
allUsers = seedUsers();
currentUsers = chance.pick(allUsers, chance.integerRange(3, allUsers.length));

module.exports = chance;
