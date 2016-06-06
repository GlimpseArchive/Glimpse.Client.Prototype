import { createSpans, filtersReducer, isMessageObject, messagesReducer } from '../../../src/request/reducers/RequestDetailLoggingReducer';

import { Action } from 'redux';

import * as chai from 'chai';
import * as util from 'util';

const should = chai.should();

describe('RequestDetailLoggingReducers', () => {

    function createLogMessage(level: string) {
        return {            
            level: level,
            message: 'message',
            isObject: false,
            spans: [
                {
                    text: 'message'
                }
            ]
        } 
    };
    
    function createRequest(messages?: ({ ordinal: number, id: string, type: string, payload })[]) {
        return {
            messages: messages.reduce((prev, current) => {
                    prev[current.id] = current;
                    
                    return prev;
                },
                {}),
            types: messages.reduce((prev, current) => {
                    const type = prev[current.type];
                    
                    if (!type) {
                        prev[current.type] = [ current.id ];
                    }
                    else {
                        type.push(current.id);                        
                    }
                    
                    return prev;
                },
                {})
        };
    }

    function createAction(type?: string, payload?): Action {
        return <Action>{
            type: type,
            payload: payload
        };
    }

    describe('#isMessageObject', () => {
        it('should return false for undefined messages', () => {
            const isObject = isMessageObject(undefined);
            
            isObject.should.equal(false);
        });

        it('should return false for empty messages', () => {
            const isObject = isMessageObject('');
            
            isObject.should.equal(false);
        });

        it('should return false for plain text messages', () => {
            const isObject = isMessageObject('this is plain text');
            
            isObject.should.equal(false);
        });

        it('should return true for JavaScript-like messages', () => {
            const isObject = isMessageObject('{ key: \'value\' }');
            
            isObject.should.equal(true);
        });

        it('should return true for JSON-like messages', () => {
            const isObject = isMessageObject('{ \'key\': \'value\' }');
            
            isObject.should.equal(true);
        });

        it('should return true for JavaScript stringified-like messages', () => {
            const isObject = isMessageObject('ServerResponse { key: \'value\' }');
            
            isObject.should.equal(true);
        });
        
        it('should return true for a JavaScript object', () => {
            class TestObject {
                constructor(public key1: string, public key2: number) {
                }
            }
            
            const testObject = new TestObject('value1', 2);            
            const message = util.inspect(testObject);
            const isObject = isMessageObject(message);
            
            isObject.should.equal(true);
        });
        
        it('should return true for objects with whitespace', () => {
            const isObject = isMessageObject(' { key: \'value\' } ');
            
            isObject.should.equal(true);
        });

        it('should return false for text lacking starting brace', () => {
            const isObject = isMessageObject(' key: \'value\' } ');
            
            isObject.should.equal(false);
        });

        it('should return false for text lacking ending brace', () => {
            const isObject = isMessageObject(' { key: \'value\' ');
            
            isObject.should.equal(false);
        });

        it('should return false for text with inverted braces', () => {
            const isObject = isMessageObject(' } key: \'value\' { ');
            
            isObject.should.equal(false);
        });
    });

    describe('#createSpans', () => {
        it('should return one span for undefined messages', () => {
            const spans = createSpans(undefined, []);

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should return one span for empty messages', () => {
            const spans = createSpans('', []);

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should return one span for message with undefined replaced regions', () => {
            const spans = createSpans('message', []);

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should return one span for message with no replaced regions', () => {
            const spans = createSpans('message', []);

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should return one replaced span for entirely replaced message', () => {
            const spans = createSpans('message',
            [
                { start: 0, end: 7 }
            ]);

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            spans[0].wasReplaced.should.equal(true);
        });

        it('should return a beginning replaced span', () => {
            const spans = createSpans(
                'spanmessage',
                [
                    { start: 0, end: 4}
                ]);

            should.exist(spans);
            spans.length.should.equal(2);

            spans[0].text.should.equal('span');
            should.exist(spans[0].wasReplaced);
            spans[0].wasReplaced.should.equal(true);

            spans[1].text.should.equal('message');
            should.not.exist(spans[1].wasReplaced);
        });

        it('should return an end replaced span', () => {
            const spans = createSpans(
                'messagespan',
                [
                    { start: 7, end: 11}
                ]);

            should.exist(spans);
            spans.length.should.equal(2);

            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);

            spans[1].text.should.equal('span');
            should.exist(spans[1].wasReplaced);
            spans[1].wasReplaced.should.equal(true);
        });

        it('should return a middle replaced span', () => {
            const spans = createSpans(
                'beginspanend',
                [
                    { start: 5, end: 9}
                ]);

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
            const spans = createSpans(
                'beginspan1middlespan2end',
                [
                    { start: 5, end: 10},
                    { start: 16, end: 21}
                ]);

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
            const spans = createSpans(
                'beginspan1span2end',
                [
                    { start: 5, end: 10},
                    { start: 10, end: 15}
                ]);

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
            const spans = createSpans(
                'beginspan1middlespan2end',
                [
                    { start: 16, end: 21},
                    { start: 5, end: 10}
                ]);

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
            const spans = createSpans(
                'message',
                [
                    { start: -1, end: 1 }
                ]);

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should ignore spans with negative end indices', () => {
            const spans = createSpans(
                'message',
                [
                    { start: 0, end: -1 }
                ]);

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should ignore spans with start indices exceeding message length', () => {
            const spans = createSpans(
                'message',
                [
                    { start: 7, end: 7 }
                ]);

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should ignore spans with end indices exceeding message length', () => {
            const spans = createSpans(
                'message',
                [
                    { start: 0, end: 8 }
                ]);

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should ignore spans with inverted start and end indices', () => {
            const spans = createSpans(
                'message',
                [
                    { start: 4, end: 3 }
                ]);

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should ignore zero-length spans', () => {
            const spans = createSpans(
                'message',
                [
                    { start: 3, end: 3 }
                ]);

            should.exist(spans);
            spans.length.should.equal(1);
            spans[0].text.should.equal('message');
            should.not.exist(spans[0].wasReplaced);
        });

        it('should ignore spans that overlap previous spans', () => {
            const spans = createSpans(
                'message',
                [
                    { start: 3, end: 5 },
                    { start: 4, end: 6 }
                ]);

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
    
    describe('#filtersReducer', () => {
        it('should default to the standard set of filters', () => {
            const state = undefined;
            const newState = filtersReducer(state, createAction());
            
            should.exist(newState);
            
            newState.should.deep.equal([
                { level: 'Critical', isShown: true },
                { level: 'Error', isShown: true },
                { level: 'Warning', isShown: true },
                { level: 'Information', isShown: true },
                { level: 'Verbose', isShown: true },
                { level: 'Debug', isShown: true }
            ]); 
        });
        
        it('should ignore actions not understood', () => {
            const state = [ { level: 'Critical', isShown: false } ];
            const newState = filtersReducer(state, createAction());
            
            should.exist(newState);
            
            newState.should.equal(state);
        })

        it('should toggle a true value to false', () => {
            const state = [
                { level: 'Critical', isShown: true },
                { level: 'Error', isShown: false }
            ];
            const newState = filtersReducer(state, createAction('request.detail.logging.toggle', 0));
            
            should.exist(newState);
            
            newState.should.deep.equal([
                { level: 'Critical', isShown: false },
                { level: 'Error', isShown: false }
            ]);
        });

        it('should toggle a false value to true', () => {
            const state = [
                { level: 'Critical', isShown: true },
                { level: 'Error', isShown: false }
            ];
            const newState = filtersReducer(state, createAction('request.detail.logging.toggle', 1));
            
            should.exist(newState);
            
            newState.should.deep.equal([
                { level: 'Critical', isShown: true },
                { level: 'Error', isShown: true }
            ]);
        });

        it('should set all filters to true on show-all', () => {
            const state = [
                { level: 'Critical', isShown: false },
                { level: 'Error', isShown: false }
            ];
            const newState = filtersReducer(state, createAction('request.detail.logging.all', 1));
            
            should.exist(newState);
            
            newState.should.deep.equal([
                { level: 'Critical', isShown: true },
                { level: 'Error', isShown: true }
            ]);
        });
        
        it('should ignore show-all if all are already shown', () => {
            const state = [
                { level: 'Critical', isShown: true },
                { level: 'Error', isShown: true }
            ];
            const newState = filtersReducer(state, createAction('request.detail.logging.all', 1));
            
            should.exist(newState);
            
            newState.should.equal(state);
        });
    });
    
    describe('#messagesReducer', () => {
        it('should default to no messages', () => {
            const state = undefined;
            const newState = messagesReducer(state, createAction());
            
            should.exist(newState);
            
            newState.length.should.equal(0);
        });
        
        it('should ignore actions not understood', () => {
            const state = [ 
                    createLogMessage('Debug')
            ];
            const newState = messagesReducer(state, createAction());
            
            should.exist(newState);
            
            newState.should.equal(state);
        });
        
        it('should add a logging message', () => {
            const state = [];
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'log-write',
                    payload: {
                        level: 'Debug',
                        message: 'message'
                    }
                }
            ]);
            
            const newState = messagesReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);

            newState.should.deep.equal([
                {
                    level: 'Debug',
                    message: 'message',
                    isObject: false,
                    spans: [
                        {
                            text: 'message'
                        }
                    ]
                }
            ]);            
        });

        it('should add a logged object', () => {
            const state = [];
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'log-write',
                    payload: {
                        level: 'Debug',
                        message: '{ key: \'value\' }'
                    }
                }
            ]);
            
            const newState = messagesReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);

            newState.should.deep.equal([
                {
                    level: 'Debug',
                    message: '{ key: \'value\' }',
                    isObject: true,
                    spans: [
                        {
                            text: '{ key: \'value\' }'
                        }
                    ]
                }
            ]);            
        });

        it('should add a spanned message', () => {
            const state = [];
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'log-write',
                    payload: {
                        level: 'Debug',
                        message: 'message',
                        replacedRegions: [
                            { start: 0, end: 7 }
                        ]
                    }
                }
            ]);
            
            const newState = messagesReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);

            newState.should.deep.equal([
                {
                    level: 'Debug',
                    message: 'message',
                    isObject: false,
                    spans: [
                        {
                            text: 'message',
                            wasReplaced: true
                        }
                    ]
                }
            ]);            
        });

        it('should concatenate and sort log messages', () => {
            const state = [];
            const request = createRequest([
                {
                    ordinal: 2,
                    id: 'message2',
                    type: 'log-write',
                    payload: {
                        level: 'Error',
                        message: 'error'
                    }
                },
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'log-write',
                    payload: {
                        level: 'Debug',
                        message: 'debug'
                    }
                }
            ]);
            
            const newState = messagesReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);

            newState.should.deep.equal([
                {
                    level: 'Debug',
                    message: 'debug',
                    isObject: false,
                    spans: [
                        {
                            text: 'debug'
                        }
                    ]
                },
                {
                    level: 'Error',
                    message: 'error',
                    isObject: false,
                    spans: [
                        {
                            text: 'error'
                        }
                    ]
                }
            ]);            
        });
    });
});
