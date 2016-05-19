'use strict';

import { ILoggingLevelModel } from '../../../src/request/component-models/ILoggingComponentModel';
import { LoggingComponentModel, LogMessageModel } from '../../../src/request/component-models/LoggingComponentModel';
import { MockGlimpse } from '../../mocks/MockGlimpse';
import { MockRequestDetailStore } from '../mocks/MockRequestDetailStore';

import * as _ from 'lodash';
import * as chai from 'chai';
import * as util from 'util';

const should = chai.should();

describe('LogMessageModel', () => {
    function createModel(message: string, replacedRegions?: ({ start: number, end: number })[]): LogMessageModel {
        return new LogMessageModel(
            {
                id: '0',
                ordinal: 0,
                payload: {
                    level: 'Debug',
                    message: message,
                    replacedRegions: replacedRegions
                }
            },
            1);
    }
    
    describe('#isObject', () => {
        it('should return false for undefined messages', () => {
            const model = createModel(undefined);
            
            model.isObject.should.equal(false);
        });

        it('should return false for empty messages', () => {
            const model = createModel('');
            
            model.isObject.should.equal(false);
        });

        it('should return false for plain text messages', () => {
            const model = createModel('this is plain text');
            
            model.isObject.should.equal(false);
        });

        it('should return true for JavaScript-like messages', () => {
            const model = createModel('{ key: \'value\' }');
            
            model.isObject.should.equal(true);
        });

        it('should return true for JSON-like messages', () => {
            const model = createModel('{ \'key\': \'value\' }');
            
            model.isObject.should.equal(true);
        });

        it('should return true for JavaScript stringified-like messages', () => {
            const model = createModel('ServerResponse { key: \'value\' }');
            
            model.isObject.should.equal(true);
        });
        
        it('should return true for a JavaScript object', () => {
            class TestObject {
                constructor(public key1: string, public key2: number) {
                }
            }
            
            const testObject = new TestObject('value1', 2);            
            const message = util.inspect(testObject);
            const model = createModel(message);
            
            model.isObject.should.equal(true);
        });
        
        it('should return true for objects with whitespace', () => {
            const model = createModel(' { key: \'value\' } ');
            
            model.isObject.should.equal(true);
        });

        it('should return false for text lacking starting brace', () => {
            const model = createModel(' key: \'value\' } ');
            
            model.isObject.should.equal(false);
        });

        it('should return false for text lacking ending brace', () => {
            const model = createModel(' { key: \'value\' ');
            
            model.isObject.should.equal(false);
        });

        it('should return false for text with inverted braces', () => {
            const model = createModel(' } key: \'value\' { ');
            
            model.isObject.should.equal(false);
        });
    });

    describe('#spans', () => {
        it('should return one span for undefined messages', () => {
            const model = createModel(undefined);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should return one span for empty messages', () => {
            const model = createModel('');

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should return one span for message with undefined replaced regions', () => {
            const model = createModel('message');

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should return one span for message with no replaced regions', () => {
            const model = createModel('message', []);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should return one replaced span for entirely replaced message', () => {
            const model = createModel('message',
            [
                { start: 0, end: 7 }
            ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            spans[0].wasReplaced.should.equal(true);
        });

        it('should return a beginning replaced span', () => {
            const model = createModel(
                'spanmessage',
                [
                    { start: 0, end: 4}
                ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(2);

            spans[0].text.should.equal('span');
            should.exist(spans[0].wasReplaced);
            spans[0].wasReplaced.should.equal(true);

            spans[1].text.should.equal('message');
            should.not.exist(spans[1].wasReplaced);
        });

        it('should return an end replaced span', () => {
            const model = createModel(
                'messagespan',
                [
                    { start: 7, end: 11}
                ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(2);

            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);

            spans[1].text.should.equal('span');
            should.exist(spans[1].wasReplaced);
            spans[1].wasReplaced.should.equal(true);
        });

        it('should return a middle replaced span', () => {
            const model = createModel(
                'beginspanend',
                [
                    { start: 5, end: 9}
                ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(3);

            spans[0].text.should.equal('begin');
            should.not.exist(spans[0].wasReplaced);

            spans[1].text.should.equal('span');
            should.exist(spans[1].wasReplaced);
            spans[1].wasReplaced.should.equal(true);

            spans[2].text.should.equal('end');
            should.not.exist(spans[2].wasReplaced);
        });

        it('should return multiple replaced spans', () => {
            const model = createModel(
                'beginspan1middlespan2end',
                [
                    { start: 5, end: 10},
                    { start: 16, end: 21}
                ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(5);

            spans[0].text.should.equal('begin');
            should.not.exist(spans[0].wasReplaced);

            spans[1].text.should.equal('span1');
            should.exist(spans[1].wasReplaced);
            spans[1].wasReplaced.should.equal(true);

            spans[2].text.should.equal('middle');
            should.not.exist(spans[2].wasReplaced);

            spans[3].text.should.equal('span2');
            should.exist(spans[3].wasReplaced);
            spans[3].wasReplaced.should.equal(true);

            spans[4].text.should.equal('end');
            should.not.exist(spans[4].wasReplaced);
        });

        it('should return multiple, back-to-back replaced spans', () => {
            const model = createModel(
                'beginspan1span2end',
                [
                    { start: 5, end: 10},
                    { start: 10, end: 15}
                ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(4);

            spans[0].text.should.equal('begin');
            should.not.exist(spans[0].wasReplaced);

            spans[1].text.should.equal('span1');
            should.exist(spans[1].wasReplaced);
            spans[1].wasReplaced.should.equal(true);

            spans[2].text.should.equal('span2');
            should.exist(spans[2].wasReplaced);
            spans[2].wasReplaced.should.equal(true);

            spans[3].text.should.equal('end');
            should.not.exist(spans[3].wasReplaced);
        });

        it('should return sorted replaced spans', () => {
            const model = createModel(
                'beginspan1middlespan2end',
                [
                    { start: 16, end: 21},
                    { start: 5, end: 10}
                ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(5);

            spans[0].text.should.equal('begin');
            should.not.exist(spans[0].wasReplaced);

            spans[1].text.should.equal('span1');
            should.exist(spans[1].wasReplaced);
            spans[1].wasReplaced.should.equal(true);

            spans[2].text.should.equal('middle');
            should.not.exist(spans[2].wasReplaced);

            spans[3].text.should.equal('span2');
            should.exist(spans[3].wasReplaced);
            spans[3].wasReplaced.should.equal(true);

            spans[4].text.should.equal('end');
            should.not.exist(spans[4].wasReplaced);
        });

        it('should ignore spans with negative start indices', () => {
            const model = createModel(
                'message',
                [
                    { start: -1, end: 1 }
                ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should ignore spans with negative end indices', () => {
            const model = createModel(
                'message',
                [
                    { start: 0, end: -1 }
                ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should ignore spans with start indices exceeding message length', () => {
            const model = createModel(
                'message',
                [
                    { start: 7, end: 7 }
                ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should ignore spans with end indices exceeding message length', () => {
            const model = createModel(
                'message',
                [
                    { start: 0, end: 8 }
                ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should ignore spans with inverted start and end indices', () => {
            const model = createModel(
                'message',
                [
                    { start: 4, end: 3 }
                ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should ignore zero-length spans', () => {
            const model = createModel(
                'message',
                [
                    { start: 3, end: 3 }
                ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should ignore spans that overlap previous spans', () => {
            const model = createModel(
                'message',
                [
                    { start: 3, end: 5 },
                    { start: 4, end: 6 }
                ]);

            const spans = model.spans;

            should.exist(spans);
            spans.length.should.equal(3);

            spans[0].text.should.equal('mes');
            should.not.exist(spans[0].wasReplaced);

            spans[1].text.should.equal('sa');
            should.exist(spans[1].wasReplaced);
            spans[1].wasReplaced.should.equal(true);

            spans[2].text.should.equal('ge');
            should.not.exist(spans[2].wasReplaced);
        });
    });
});

describe('LoggingComponentModel', () => {
    const createMessage = (ordinal, level) => {
        return {
            ordinal: ordinal,
            payload: {
                level: level
            }
        };
    };

    describe('#init', () => {
        it('should create a default set of levels with no messages', () => {
            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore();
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            componentModel.totalMessageCount.should.equal(0);

            const levels = componentModel.levels;

            should.exist(levels);

            levels.length.should.equal(6);

            levels.forEach(level => {
                level.messageCount.should.equal(0);
            });

            levels[0].level.should.equal('Critical');
            levels[1].level.should.equal('Error');
            levels[2].level.should.equal('Warning');
            levels[3].level.should.equal('Information');
            levels[4].level.should.equal('Verbose');
            levels[5].level.should.equal('Debug');
        });

        it('should create a level for each message level in request', () => {
            const messages = [];

            for (let i = 0; i < 2; i++) {
                messages.push(createMessage(messages.length + 1, 'Critical'));
                messages.push(createMessage(messages.length + 1, 'Error'));
                messages.push(createMessage(messages.length + 1, 'Warning'));
                messages.push(createMessage(messages.length + 1, 'Information'));
                messages.push(createMessage(messages.length + 1, 'Verbose'));
                messages.push(createMessage(messages.length + 1, 'Debug'));
            }

            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore();
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {
                        logWrite: messages
                    };
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            componentModel.totalMessageCount.should.equal(12);

            const levels = componentModel.levels;

            should.exist(levels);

            levels.length.should.equal(6);

            levels.forEach(level => {
                level.messageCount.should.equal(2);
            });
        });

        it('should create a level for each message level in request and defaults for others', () => {
            const messages = [];

            messages.push(createMessage(messages.length + 1, 'Critical'));

            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore();
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {
                        logWrite: messages
                    };
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            componentModel.totalMessageCount.should.equal(1);

            const levels = componentModel.levels;

            should.exist(levels);

            levels.length.should.equal(6);

            levels.forEach(level => {
                if (level.level === 'Critical') {
                    level.messageCount.should.equal(1);
                }
                else {
                    level.messageCount.should.equal(0);
                }
            });
        });
    });

    describe('#getMessages', () => {
        it('should return all messages with no filter state', () => {
            const messages = [];

            for (let i = 0; i < 2; i++) {
                messages.push(createMessage(messages.length + 1, 'Critical'));
                messages.push(createMessage(messages.length + 1, 'Error'));
                messages.push(createMessage(messages.length + 1, 'Warning'));
                messages.push(createMessage(messages.length + 1, 'Information'));
                messages.push(createMessage(messages.length + 1, 'Verbose'));
                messages.push(createMessage(messages.length + 1, 'Debug'));
            }

            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore();
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {
                        logWrite: messages
                    };
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            const filteredMessages = componentModel.getMessages();

            should.exist(filteredMessages);

            filteredMessages.length.should.equal(12);

            for (let i = 0; i < 12; i++) {
                filteredMessages[i].ordinal.should.equal(i + 1);
            }
        });

        it('should return all messages with an empty filter state', () => {
            const messages = [];

            for (let i = 0; i < 2; i++) {
                messages.push(createMessage(messages.length + 1, 'Critical'));
                messages.push(createMessage(messages.length + 1, 'Error'));
                messages.push(createMessage(messages.length + 1, 'Warning'));
                messages.push(createMessage(messages.length + 1, 'Information'));
                messages.push(createMessage(messages.length + 1, 'Verbose'));
                messages.push(createMessage(messages.length + 1, 'Debug'));
            }

            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore({});
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {
                        logWrite: messages
                    };
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            const filteredMessages = componentModel.getMessages();

            should.exist(filteredMessages);

            filteredMessages.length.should.equal(12);

            for (let i = 0; i < 12; i++) {
                filteredMessages[i].ordinal.should.equal(i + 1);
            }
        });

        it('should return all messages when all filters selected', () => {
            const messages = [];

            for (let i = 0; i < 2; i++) {
                messages.push(createMessage(messages.length + 1, 'Critical'));
                messages.push(createMessage(messages.length + 1, 'Error'));
                messages.push(createMessage(messages.length + 1, 'Warning'));
                messages.push(createMessage(messages.length + 1, 'Information'));
                messages.push(createMessage(messages.length + 1, 'Verbose'));
                messages.push(createMessage(messages.length + 1, 'Debug'));
            }

            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore({
                Critical: true,
                Error: true,
                Warning: true,
                Information: true,
                Verbose: true,
                Debug: true
            });
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {
                        logWrite: messages
                    };
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            const filteredMessages = componentModel.getMessages();

            should.exist(filteredMessages);

            filteredMessages.length.should.equal(12);

            for (let i = 0; i < 12; i++) {
                filteredMessages[i].ordinal.should.equal(i + 1);
            }
        });

        it('should return only messages of selected levels', () => {
            const messages = [];

            for (let i = 0; i < 2; i++) {
                messages.push(createMessage(messages.length + 1, 'Critical'));
                messages.push(createMessage(messages.length + 1, 'Error'));
                messages.push(createMessage(messages.length + 1, 'Warning'));
                messages.push(createMessage(messages.length + 1, 'Information'));
                messages.push(createMessage(messages.length + 1, 'Verbose'));
                messages.push(createMessage(messages.length + 1, 'Debug'));
            }

            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore({
                Critical: false,
                Error: true,
                Warning: false,
                Information: false,
                Verbose: true,
                Debug: false
            });
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {
                        logWrite: messages
                    };
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            const filteredMessages = componentModel.getMessages();

            should.exist(filteredMessages);

            filteredMessages.length.should.equal(4);

            filteredMessages[0].ordinal.should.equal(2);
            filteredMessages[1].ordinal.should.equal(5);
            filteredMessages[2].ordinal.should.equal(8);
            filteredMessages[3].ordinal.should.equal(11);
        });
    });

    describe('#isShown', () => {
        it('should return true if there is no state', () => {
            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore({});
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);

            const mockLevel: ILoggingLevelModel = {
               level: 'Critical',
               messageCount: 0
            };

            componentModel.isShown(mockLevel).should.equal(true);
        });

        it('should return true if there the state is true', () => {
            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore({
                'Critical': true
            });
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);

            const mockLevel: ILoggingLevelModel = {
               level: 'Critical',
               messageCount: 0
            };

            componentModel.isShown(mockLevel).should.equal(true);
        });

        it('should return false if there the state is false', () => {
            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore({
                'Critical': false
            });
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);

            const mockLevel: ILoggingLevelModel = {
               level: 'Critical',
               messageCount: 0
            };

            componentModel.isShown(mockLevel).should.equal(false);
        });
    });

    describe('#toggleLevel', () => {
        it('should toggle a default value to false', () => {
            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore({});
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);

            const mockLevel: ILoggingLevelModel = {
               level: 'Critical',
               messageCount: 0
            };

            componentModel.toggleLevel(mockLevel);

            mockGlimpse.emitted.length.should.equal(1);
            mockGlimpse.emitted[0].eventName = 'data.request.detail.logging.filter';
            mockGlimpse.emitted[0].eventData.should.have.property('Critical').equal(false);
        });

        it('should toggle a true value to false', () => {
            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore({
                'Critical': true
            });
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);

            const mockLevel: ILoggingLevelModel = {
               level: 'Critical',
               messageCount: 0
            };

            componentModel.toggleLevel(mockLevel);

            mockGlimpse.emitted.length.should.equal(1);
            mockGlimpse.emitted[0].eventName = 'data.request.detail.logging.filter';
            mockGlimpse.emitted[0].eventData.should.have.property('Critical').equal(false);
        });

        it('should toggle a false value to true', () => {
            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore({
                'Critical': false
            });
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);

            const mockLevel: ILoggingLevelModel = {
               level: 'Critical',
               messageCount: 0
            };

            componentModel.toggleLevel(mockLevel);

            mockGlimpse.emitted.length.should.equal(1);
            mockGlimpse.emitted[0].eventName = 'data.request.detail.logging.filter';
            mockGlimpse.emitted[0].eventData.should.have.property('Critical').equal(true);
        });
    });

    describe('#showAll', () => {
        it('should do nothing if given no state', () => {
            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore();
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);

            componentModel.showAll();

            mockGlimpse.emitted.length.should.equal(0);
        });

        it('should do nothing if given an empty state', () => {
            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore({});
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);

            componentModel.showAll();

            mockGlimpse.emitted.length.should.equal(0);
        });

        it('should do nothing if given an all-selected state', () => {
            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore({
                'Critical': true
            });
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);

            componentModel.showAll();

            mockGlimpse.emitted.length.should.equal(0);
        });

        it('should toggle un-selected state', () => {
            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore({
                'Critical': true,
                'Error': false
            });
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockGlimpse, mockStore, mockMessageProcessor);

            componentModel.showAll();

            mockGlimpse.emitted.length.should.equal(1);
            mockGlimpse.emitted[0].eventName = 'data.request.detail.logging.filter';

            _.every(mockGlimpse.emitted[0].eventData, shown => shown).should.equal(true);
        });
    });
});
