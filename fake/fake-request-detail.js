/* jshint camelcase: false */
'use strict';

var _ = require('lodash');
var chance = require('./fake-extension');

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

var tabs = {
    messageTransform: function(tab, context) {
        var message = {
            type: 'tab.' + tab.title.toLowerCase(),
            title: tab.title,
            payload: tab.payload,
            context: context,
            id: chance.guid()
        };
        
        return message;
    },
    strategies: {
        execution: function(requestData) {
                return {
                        title: 'Execution',
                        payload: requestData.execution
                    };
            },
        log: function(requestData) {
                return {
                        title: 'Log',
                        payload: requestData.log
                    };
            },
        dataAccess: function(requestData) {
                return {
                        title: 'Data',
                        payload: requestData.dataAccess
                    };
            },
        generic: (function() {
            var create = function() {
                return  [ {
                        'Actor': 'Mark Hamill',
                        'Character': 'Luke Skywalker',
                        'Gender': 'Male',
                        'Age': '21'
                    }, {
                        'Character': 'Darth Vader',
                        'Actor': 'James Earl Jones',
                        'Gender': 'Male',
                        'Age': '45'
                    }, {
                        'Actor': 'Harrison Ford',
                        'Character': {
                            'Mark Hamill': 'Luke Skywalker',
                            'James Earl Jones': 'Darth Vader',
                            'Harrison Ford': 'Han Solo'
                        },
                        'Gender': 'Male',
                        'Age': '25'
                    }, {
                        'Actor': 'Carrie Fisher',
                        'Character': 'Princess Leia Organa',
                        'Gender': 'Female',
                        'Age': '21'
                    }, {
                        'Actor': 'Peter Cushing',
                        'Character': [ {
                                'Actor': 'Mark Hamill',
                                'Character': 'Luke Skywalker',
                                'Gender': 'Male',
                                'Age': '21'
                            }, {
                                'Actor': 'James Earl Jones',
                                'Character': 'Darth Vader',
                                'Gender': 'Male',
                                'Age': '45'
                            }, {
                                'Actor': 'Harrison Ford',
                                'Character': 'Han Solo',
                                'Gender': 'Male',
                                'Age': '25'
                            }, {
                                'Actor': 'Carrie Fisher',
                                'Character': 'Princess Leia Organa',
                                'Gender': 'Female',
                                'Age': '21'
                            }, {
                                'Actor': 'Peter Cushing',
                                'Character': 'Grand Moff Tarkin',
                                'Gender': 'Female',
                                'Age': '69'
                            }, {
                                'Actor': 'Alec Guinness',
                                'Character': 'Ben Obi-Wan Kenobi',
                                'Gender': 'Female',
                                'Age': '70'
                            }, {
                                'Actor': 'Anthony Daniels',
                                'Character': 'C-3PO',
                                'Gender': 'Droid',
                                'Age': '101'
                            }, {
                                'Actor': 'Kenny Baker',
                                'Character': 'R2-D2',
                                'Gender': 'Droid',
                                'Age': '150'
                            } ],
                        'Gender': 'Female',
                        'Age': '69'
                    }, {
                        'Actor': 'Alec Guinness',
                        'Character': 'Ben Obi-Wan Kenobi',
                        'Gender': 'Female',
                        'Age': '70'
                    }, {
                        'Actor': 'Anthony Daniels',
                        'Character': 'C-3PO',
                        'Gender': 'Droid',
                        'Age': '101'
                    } 
                ];
            };
    
            return function(requestData) {
                return {
                        title: 'Generic',
                        payload: create()
                    };
            };
        })(),
    }
};

var generate = (function() {
    var processGenerationModel = function(generationModel) { 
        var modelProcessor = new RequestModelProcessor();
        modelProcessor.processAction(generationModel.rawRequest, generationModel.request);
        
        return modelProcessor.model;
    };
    var generateTabMessages = function(generationModel, detailModel) {
          var messages = _.map(tabs.strategies, function(value) {
              var tabModel = value(detailModel);
              var tabMessage = tabs.messageTransform(tabModel, generationModel.context);
              
              return tabMessage;
          });
          
          return messages;
    };
    
    return function(generationModel) {
        var detailModel = processGenerationModel(generationModel);
        var detailMessages = generateTabMessages(generationModel, detailModel);
        
        return {
            messages: detailMessages
        };
    };
})();

module.exports = { generate: generate };
