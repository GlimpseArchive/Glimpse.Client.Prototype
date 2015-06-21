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
        return chance.pick(mvcActions).uri;
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
        if (source[property] == undefined) {
            // Since this is dev time, we are trying to help catch problems here
            throw new TypeError('Property doesnt exist on source');
        }
        
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
                    mask: '{controller}/{action}/{id}',
                    resolution: [
                        { key: 'controller', value: controller, default: 'home' },
                        { key: 'action', value: action, default: 'index' },
                        { key: 'id', value: id, default: null }
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
                        uri: '/Store/Browse?Genre=' + genre,
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
                        uri: '/Store/Details/' + id, 
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
                        uri: '/', 
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
                        uri: '/ShoppingCart/', 
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
                        uri: '/Store/', 
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
                        uri: '/Account/LogIn/', 
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
        { id: chance.guid(), name: 'Anthony', avatarUrl: 'https://avatars.githubusercontent.com/u/585619' },
        { id: chance.guid(), name: 'Nik', avatarUrl: 'https://avatars.githubusercontent.com/u/199026' },
        { id: chance.guid(), name: 'Christophe', avatarUrl: 'https://avatars.githubusercontent.com/u/1467346' },
        { id: chance.guid(), name: 'Bjorn', avatarUrl: 'https://avatars.githubusercontent.com/u/1607579' },
        { id: chance.guid(), name: 'Ian', avatarUrl: 'https://avatars.githubusercontent.com/u/52329?' },
        { id: chance.guid(), name: 'Keith', avatarUrl: 'https://avatars.githubusercontent.com/u/133987?' },
        { id: chance.guid(), name: 'Aaron', avatarUrl: 'https://avatars.githubusercontent.com/u/434140?' },
        { id: chance.guid(), name: 'Jeff', avatarUrl: 'https://avatars.githubusercontent.com/u/683658?' },
        { id: chance.guid(), name: 'Kristian', avatarUrl: 'https://avatars.githubusercontent.com/u/582487?' },
        { id: chance.guid(), name: 'James', avatarUrl: 'https://avatars.githubusercontent.com/u/1197383?' }
    ];
};

// TODO: Should be brought into a different file/module 
var generateMvcRequest = function(dateTime) {
    var source = chance.mvcAction();
    
    // TODO: Need to go through and update child actions and queries
    
	// NOTE: now that we have cloned the this request source, need to go through 
	//       and setup the request for this instance 
    var serverLowerTime = chance.integerRange(5, 10);
    var serverUpperTime = chance.integerRange(60, 100);
    var httpStatus = chance.httpStatus();
    
    source.id = chance.guid();
    source.dateTime = dateTime || moment().toISOString();
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
    source.messages = generateMvcMessages(source); 
    source.request = generateSystemRequest(source);
    
    return source; 
};

// TODO: Should be brought into a different file/module 
// TODO: This could be more advanced than it is
var generateMvcMessages = (function() {    
    var generate = {
        common: {
            message: function(type, context) {
                return {
                    type: type,
                    context: context,
                    id: chance.guid()
                };
            },
            tabMessage: function(title, payload, context) { 
                var message = {
                    type: 'tab.' + title.toLowerCase(),
                    title: title,
                    payload: payload,
                    context: context,
                    id: chance.guid()
                };
                
                return message; 
            }
        },
        instance: {
            start: function(source) {
                var message = generate.common.message('request-start', source.context);
                message.index = mapProperties(source, {}, [ 'uri', 'dateTime', 'method', 'contentType', 'user' ]);
                
                return message;
            },
            framework: function(source) {
                var message = generate.common.message('request-framework', source.context);
                message.abstract = mapProperties(source, {}, [ 'networkTime', 'serverTime', 'clientTime', 'controller', 'action', 'actionTime', 'viewTime', 'queryTime', 'queryCount' ]);
                
                return message;
            },
            end: function(source) {
                var message = generate.common.message('request-end', source.context);
                message.index = mapProperties(source, {}, [ 'duration', 'statusCode', 'statusText' ]);
                
                return message;
            }
        },
        dynamic: {
            tabs: {
                execution: function(requestData, source) {
                    var message = generate.common.tabMessage('Execution', requestData.execution, source.context);
                    
                    return message;
                },
                log: function(requestData, source) {
                    var message = generate.common.tabMessage('Log', requestData.log, source.context);
                    
                    return message; 
                },
                data: function(requestData, source) {
                    var message = generate.common.tabMessage('Data', requestData.dataAccess, source.context);
                    
                    return message;
                },
                generic: function(requestData, source) {
                    var payload = [ {'Actor':'MarkHamill','Character':'LukeSkywalker','Gender':'Male','Age':'21'},{'Character':'DarthVader','Actor':'JamesEarlJones','Gender':'Male','Age':'45'},{'Actor':'HarrisonFord','Character':{'MarkHamill':'LukeSkywalker','JamesEarlJones':'DarthVader','HarrisonFord':'HanSolo'},'Gender':'Male','Age':'25'},{'Actor':'CarrieFisher','Character':'PrincessLeiaOrgana','Gender':'Female','Age':'21'},{'Actor':'PeterCushing','Character':[{'Actor':'MarkHamill','Character':'LukeSkywalker','Gender':'Male','Age':'21'},{'Actor':'JamesEarlJones','Character':'DarthVader','Gender':'Male','Age':'45'},{'Actor':'HarrisonFord','Character':'HanSolo','Gender':'Male','Age':'25'},{'Actor':'CarrieFisher','Character':'PrincessLeiaOrgana','Gender':'Female','Age':'21'},{'Actor':'PeterCushing','Character':'GrandMoffTarkin','Gender':'Female','Age':'69'},{'Actor':'AlecGuinness','Character':'BenObi-WanKenobi','Gender':'Female','Age':'70'},{'Actor':'AnthonyDaniels','Character':'C-3PO','Gender':'Droid','Age':'101'},{'Actor':'KennyBaker','Character':'R2-D2','Gender':'Droid','Age':'150'}],'Gender':'Female','Age':'69'},{'Actor':'AlecGuinness','Character':'BenObi-WanKenobi','Gender':'Female','Age':'70'},{'Actor':'AnthonyDaniels','Character':'C-3PO','Gender':'Droid','Age':'101'} ];
                    
                    var message = generate.common.tabMessage('Generic', payload, source.context);
                    
                    return message;
                }
            }
        }
    };
    
    var executeInstanceMessages = function(source, target) {
        _.forEach(generate.instance, function(strategy) {
            target.push(strategy(source));
        });
    };
    var executeTabMessages = function(source, target) {
        var modelProcessor = new RequestModelProcessor();
        modelProcessor.processAction(source, source); 
        
        _.forEach(generate.dynamic.tabs, function(strategy) {
            target.push(strategy(modelProcessor.model, source))
        });
    };
    
    return function(source) {
        var messages = [];
        
        executeInstanceMessages(source, messages);
        executeTabMessages(source, messages);
        
        return messages;
    };
})();

// TODO: In the end this should be pulled into the main app, as this model should be derived there somehow
// TODO: THIS REALLY ISN'T GREAT but wanted an independent way of doing this
var generateSystemRequest = function(source) {
    var request = {
        abstract: {},
        messages: _.indexBy(source.messages, 'id'),
        tabs: {}
    };
     
    mapProperties(source, request, [ 'id', 'uri', 'dateTime', 'method', 'contentType', 'user',  'duration', 'statusCode', 'statusText' ]);
    mapProperties(source, request.abstract, [ 'networkTime', 'serverTime', 'clientTime', 'controller', 'action', 'actionTime', 'viewTime', 'queryTime', 'queryCount' ]);

    // This has been removed for the moment, could be brought back if trying
    // to sinulate full detail requests that are stored in cache, but not doing that 
    // at the moment. 
    // TODO: Detect when requests are generated for initial local storage requests,
    //       then randmonly give some of those full details, 
    
    // TODO: update when tab data is handelled differently 
    request.tabs = _(source.messages)
        .filter(function(message) {
            return message.title != null;
        })
        .map(function(message) {
            return {
                title: message.title,
                payload: message.payload,
                type: message.type
            };
        })
        .indexBy('type')
        .value();
    
    return request;
};

// TODO: In the end this should be pulled into the main app, as this model should be derived there somehow
var RequestModelProcessor = function() {
    this.model = {
        dataAccess: [],
        execution: [],
        log: []  
    }; 
};
RequestModelProcessor.support = {
    log: (function () {
        function processTemplate(template) {
            var message = template.mask;
            for (var key in template.values) {
                message = message.replace('{' + key + '}', template.values[key]);
            }

            return message;
        }

        return function (log) {
            if (log.template) {
                log.message = processTemplate(log.template);
            }

            return log;
        };
    })(),
    childTimings: function (events, availableTime, offset) {
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
RequestModelProcessor.prototype = {
    registerActivities: function(activities) {
        if (activities) {
            for (var i = 0; i < activities.length; i++) {
                var activity = activities[i];
                activity.type = 'data';
                activity.duration = activity.duration.toFixed(2);
                // activity.time = '1411576658503';
                // activity.offset = 124.12;

                this.model.dataAccess.push(activity);
            }
        }
    },
    registerLogs: function(logs) {
        if (logs) {
            for (var i = 0; i < logs.length; i++) {
                var log = RequestModelProcessor.support.log(logs[i]);
                log.type = 'log';
                // log.time = '1411576658503';
                // log.offset = 124.12;

                this.model.log.push(log);
            }
        }
    },
    registerRoute: function(record) {
        var route = {
            type: 'route',
            duration: chance.durationRange(0, 1),
            // time: '1411576658503',
            // offset: 124.12,
            name: record.name,
            mask: record.mask,
            resolution: record.resolution
        };

        this.model.execution.push(route);
    },
    registerFilter: function(controller, targetMethod, filterType, category, origin, activities, logs) {
        var filter = {
            type: 'filter',
            duration: chance.durationRange(0, 1),
            // time: '1411576658503',
            // offset: 124.12,
            targetClass: controller + 'Controller',
            targetMethod: targetMethod,
            filterType: filterType,
            category: category,
            filterOrigin: origin || 'system'
        };

        this.model.execution.push(filter);

        // filters are logged and can have activities
        this.registerActivities(activities);
        this.registerLogs(logs);
    },
    registerAction: function(controller, actionTime, binding, activities, logs) {
        var action = {
            type: 'action',
            duration: actionTime.toFixed(2),
            // time: '1411576658503',
            // offset: 124.12,
            targetClass: controller + 'Controller',
            targetMethod: 'Index',
            physicalFile: 'Controller/' + controller + 'Controller.cs',
            binding: binding
        };

        this.model.execution.push(action);

        // actions are logged and can have activities
        this.registerActivities(activities);
        this.registerLogs(logs);
    },

    processSubActions: function(actions, request) {
        if (actions) {
            for (var i = 0; i < actions.length; i++) {
                this.processAction(actions[i], request);
            }
        }
    },
    processAction: function(action, request) {
        var availableTime = action.duration;
        availableTime -= RequestModelProcessor.support.childTimings(action.actions, availableTime, 2.5);
        availableTime -= RequestModelProcessor.support.childTimings(action.activities, availableTime, 1.5);

        this.registerRoute(action.route);
        this.registerFilter(action.controller, 'OnAuthorization', 'Authorization', 'Authorization', null, null, [ { template: { mask: 'User {0} authorized to execute this action', values: { '0': request.user.name } } } ]);
        this.registerFilter(action.controller, 'OnActionExecuting', 'Action', 'Executing');
        this.registerAction(action.controller, action.duration, action.binding, action.activities, action.trace);
        this.registerFilter(action.controller, 'OnActionExecuted', 'Action', 'Executed');
        this.registerFilter(action.controller, 'OnActionExecuting', 'Result', 'Executing');
        this.processSubActions(action.actions, request);
        this.registerFilter(action.controller, 'OnActionExecuted', 'Result', 'Executed');
    }
};

// TODO: when aboves are shifted this setting should be changed
mvcActions = seedMvcActions();
allUsers = seedUsers();
currentUsers = chance.pick(allUsers, chance.integerRange(3, allUsers.length));

module.exports = chance;
