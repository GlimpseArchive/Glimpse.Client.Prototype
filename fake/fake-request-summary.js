'use strict';

var chance = require('./fake-extension');
var fakeSession = require('./fake-request-user');
var moment = require('moment');

// TODO: Even though this works, structure of this is kinda crummy

function generate(dateTime) {
    var mvcAction = chance.mvcAction();
    var httpStatus = chance.httpStatus();
    var networkTime = chance.integerRange(0, 15);
    var serverLowerTime = chance.integerRange(5, 10);
    var serverUpperTime = chance.integerRange(60, 100);
    var serverTime = chance.integerRange(serverLowerTime, serverUpperTime); // TODO: Bug with these two lines
    var actionTime = chance.integerRange(serverLowerTime - 1, serverTime); // TODO: Need to verify that this works
    var viewTime = serverTime - actionTime;
    var clientTime = chance.integerRange(20, 120);
    var queryTime = chance.integerRange(2, Math.max(actionTime / 3, 3));

    var pick = {
        user: function () {
            return fakeSession.pickUser();
        },
        abstract: function () {
            return {
                    networkTime: networkTime,
                    serverTime: serverTime,
                    clientTime: clientTime,
                    controller: mvcAction.controller,
                    action: mvcAction.action,
                    actionTime: actionTime,
                    viewTime: viewTime,
                    queryTime: queryTime,
                    queryCount: chance.integerRange(1, 4)
                };
        },
        index: function () {
            return {
                    uri: mvcAction.url,
                    dateTime: dateTime || moment().toISOString(),
                    method: chance.httpMethod(),
                    contentType: chance.httpContentType(),
                    user: pick.user(),
                    duration: clientTime + serverTime + networkTime,
                    statusCode: httpStatus.code,
                    statusText: httpStatus.text,
                };
        },
        context: function () {
            return { type: 'request', id: chance.guid() };
        }
    };

    var generate = function() {
        var context = pick.context();
        var index = pick.index();
        var abstract = pick.abstract();

        var messages = [
            {
                type: 'request-start',
                context: context,
                index: {
                    uri: index.url,
                    dateTime: index.dateTime,
                    method: index.method,
                    contentType: index.contentType,
                    user: index.user
                }
            },
            {
                type: 'request-framework',
                context: context,
                abstract: abstract
            },
            {
                type: 'request-end',
                context: context,
                index: {
                    duration: index.duration,
                    statusCode: index.statusCode,
                    statusText: index.statusText,
                }
            }
        ];
        var request = index;
        request.abstract = abstract;

        return {
                data: mvcAction,
                context: context,
                messages: messages,
                request: request
            };
    };

    return generate();
}

// TODO: Need to genrate message bases responses as well as request based
//       responses.

module.exports = {
    generate: generate
};
