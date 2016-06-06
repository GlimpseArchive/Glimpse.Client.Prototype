import { getFilters, getFilteredMessages, getTotalMessageCount } from '../../../src/request/selectors/RequestDetailLoggingSelectors';
import { IRequestDetailLoggingFilterState } from '../../../src/request/stores/IRequestDetailLoggingFilterState';
import { IRequestDetailLoggingMessageState } from '../../../src/request/stores/IRequestDetailLoggingMessageState';
import { IRequestState } from '../../../src/request/stores/IRequestState';

import * as chai from 'chai';

const should = chai.should();

describe('RequestDetailLoggingSelectors', () => {
    
    function createState(messages?: IRequestDetailLoggingMessageState[], filters?: IRequestDetailLoggingFilterState[]): IRequestState {
        return {
            detail: {
                data: {
                    filters: {},
                    operations: [],
                    selectedOperationId: ''
                },
                logging: {
                    messages: messages || [],
                    filters: filters || []
                }
            }
        }
    }
    
    function createLogMessage(level?: string): IRequestDetailLoggingMessageState {
        return {
            level: level || 'level',
            message: 'message',
            isObject: false,
            spans: []
        }
    }
    
    function createFilter(level: string, isShown?: boolean): IRequestDetailLoggingFilterState {
        return {
            level: level,
            isShown: isShown !== undefined ? isShown : true
        };
    }

    describe('#getTotalMessageCount', () => {
        it('should return 0 when there are no messages', () => {
            const count = getTotalMessageCount(createState());
            
            should.exist(count);
            count.should.equal(0);
        });
        
        it('should return the number of messages', () => {
            const count = getTotalMessageCount(createState([ createLogMessage(), createLogMessage() ]));
            
            should.exist(count);
            count.should.equal(2);
        });
    });
    
    describe('#getFilters', () => {
        it('should return filters with zero count with no messages', () => {
            const filters = getFilters(
                createState(
                    [
                    ], 
                    [
                        createFilter('level1', true),
                        createFilter('level2', false)
                    ]));
            
            should.exist(filters);
            filters.length.should.equal(2);
            
            filters[0].should.deep.equal({
                name: 'level1',
                isShown: true,
                count: 0
            });

            filters[1].should.deep.equal({
                name: 'level2',
                isShown: false,
                count: 0
            });
        });

        it('should return filters with counts for each level', () => {
            const filters = getFilters(
                createState(
                    [
                        createLogMessage('level1'),
                        createLogMessage('level1'),
                        createLogMessage('level2')
                    ], 
                    [
                        createFilter('level1'),
                        createFilter('level2'),
                        createFilter('level3')
                    ]));
            
            should.exist(filters);
            filters.length.should.equal(3);
            
            filters[0].should.deep.equal({
                name: 'level1',
                isShown: true,
                count: 2
            });

            filters[1].should.deep.equal({
                name: 'level2',
                isShown: true,
                count: 1
            });

            filters[2].should.deep.equal({
                name: 'level3',
                isShown: true,
                count: 0
            });
        });
    });
    
    describe('#getFilteredMessages', () => {
        it('should return all messages when none are filtered', () => {
            const messages = getFilteredMessages(
                createState(
                    [
                        createLogMessage('level1'),
                        createLogMessage('level2')
                    ],
                    [
                        createFilter('level1'),
                        createFilter('level2')
                    ]));
                    
            should.exist(messages);
            messages.length.should.equal(2);
            
            messages[0].should.deep.equal({
                index: 1,
                message: {
                    level: 'level1',
                    message: 'message',
                    isObject: false,
                    spans: []
                }
            });

            messages[1].should.deep.equal({
                index: 2,
                message: {
                    level: 'level2',
                    message: 'message',
                    isObject: false,
                    spans: []
                }
            });
        });

        it('should return only shown messages', () => {
            const messages = getFilteredMessages(
                createState(
                    [
                        createLogMessage('level1'),
                        createLogMessage('level2')
                    ],
                    [
                        createFilter('level1'),
                        createFilter('level2')
                    ]));
                    
            should.exist(messages);
            messages.length.should.equal(2);
            
            messages[0].should.deep.equal({
                index: 1,
                message: {
                    level: 'level1',
                    message: 'message',
                    isObject: false,
                    spans: []
                }
            });

            messages[1].should.deep.equal({
                index: 2,
                message: {
                    level: 'level2',
                    message: 'message',
                    isObject: false,
                    spans: []
                }
            });
        });

        it('should return no messages when all are filtered', () => {
            const messages = getFilteredMessages(
                createState(
                    [
                        createLogMessage('level1'),
                        createLogMessage('level2')
                    ],
                    [
                        createFilter('level1', false),
                        createFilter('level2', false)
                    ]));
                    
            should.exist(messages);
            messages.length.should.equal(0);
        });
    });
});
