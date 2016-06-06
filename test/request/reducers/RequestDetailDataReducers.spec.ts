import { IRequestDetailDataOperationState } from '../../../src/request/stores/IRequestDetailDataOperationState';
import { IRequestState } from '../../../src/request/stores/IRequestState';
import { filtersReducer, operationsReducer, selectedOperationIdReducer } from '../../../src/request/reducers/RequestDetailDataReducer';

import { Action } from 'redux';
import * as chai from 'chai';

const should = chai.should();

describe('RequestDetailDataReducer', () => {
    
    // TODO: Decide if/how to consolidate common mocking functions across reducer/selector tests.
    
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
    
    function createOperation(index: number): IRequestDetailDataOperationState {
        return {
            id: index.toString(),
            command: 'command' + index,
            database: 'db' + index,
            duration: 123,
            operation: 'op' + index,
            recordCount: 456
        };
    }

    function createAction(type?: string, payload?): Action {
        return <Action>{
            type: type,
            payload: payload
        };
    }
    
    describe('#selectedOperationIdReducer', () => {
        it('should default to the first operation', () => {
            const state = undefined;
            const newState = selectedOperationIdReducer(state, createAction());
            
            should.exist(newState);
            newState.should.equal('');
        });
        
        it('should ignore unknown actions', () => {
            const state = '1';
            const newState = selectedOperationIdReducer(state, createAction());
            
            should.exist(newState);
            newState.should.equal('1');
        });

        it('should reset its state when no request is selected', () => {
            const state = '1';
            const newState = selectedOperationIdReducer(state, createAction('request.detail.update', undefined));
            
            should.exist(newState);
            newState.should.equal('');
        });

        it('should update its state to the selected operation', () => {
            const state = '1';
            const newState = selectedOperationIdReducer(state, createAction('request.detail.data.select', '2'));
            
            should.exist(newState);
            newState.should.equal('2');
        });
    });
    
    describe('#operationsReducer', () => {
        it('should default to an empty collection', () => {
            const state = undefined;
            const newState = operationsReducer(state, createAction());
            
            should.exist(newState);
            newState.length.should.equal(0);
        });
        
        it('should ignore unknown actions', () => {
            const state = [
                createOperation(0),
                createOperation(1)
            ];
            const newState = operationsReducer(state, createAction());
            
            should.exist(newState);
            newState.should.equal(state);
        });

        it('should reset the state when no request is selected', () => {
            const state = [
                createOperation(0),
                createOperation(1)
            ];
            const newState = operationsReducer(state, createAction('request.detail.update', undefined));
            
            should.exist(newState);
            newState.length.should.equal(0);
        });
        
        it('should add a MongoDB insert operation', () => {
            const state = [];
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'data-mongodb-insert',
                    payload: {
                        options: '{skip: 0}',
                        duration: 123,
                        count: 456
                    }
                }
            ]);
            const newState = operationsReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);
            newState.length.should.equal(1);
            
            newState[0].should.deep.equal({
                id: 'message1',
                database: 'MongoDB',
                command: '\"{skip: 0}\"',
                duration: 123,
                operation: 'Insert',
                recordCount: 456
            });
        });

        it('should add a MongoDB read operation', () => {
            const state = [];
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'data-mongodb-read',
                    payload: {
                        options: '{skip: 0}',
                        duration: 123
                    }
                }
            ]);
            const newState = operationsReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);
            newState.length.should.equal(1);
            
            newState[0].should.deep.equal({
                id: 'message1',
                database: 'MongoDB',
                command: '\"{skip: 0}\"',
                duration: 123,
                operation: 'Read',
                recordCount: undefined
            });
        });

        it('should add a MongoDB update operation', () => {
            const state = [];
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'data-mongodb-update',
                    payload: {
                        options: '{skip: 0}',
                        duration: 123,
                        modifiedCount: 456,
                        upsertedCount: 654
                    }
                }
            ]);
            const newState = operationsReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);
            newState.length.should.equal(1);
            
            newState[0].should.deep.equal({
                id: 'message1',
                database: 'MongoDB',
                command: '\"{skip: 0}\"',
                duration: 123,
                operation: 'Update',
                recordCount: 1110
            });
        });

        it('should add a MongoDB delete operation', () => {
            const state = [];
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'data-mongodb-delete',
                    payload: {
                        options: '{skip: 0}',
                        duration: 123,
                        count: 456
                    }
                }
            ]);
            const newState = operationsReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);
            newState.length.should.equal(1);
            
            newState[0].should.deep.equal({
                id: 'message1',
                database: 'MongoDB',
                command: '\"{skip: 0}\"',
                duration: 123,
                operation: 'Delete',
                recordCount: 456
            });
        });

        it('should concatenate and sort operations', () => {
            const state = [];
            const request = createRequest([
                {
                    ordinal: 2,
                    id: 'message2',
                    type: 'data-mongodb-delete',
                    payload: {
                        options: '{skip: 0}',
                        duration: 123,
                        count: 456
                    }
                },
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'data-mongodb-insert',
                    payload: {
                        options: '{skip: 0}',
                        duration: 123,
                        count: 456
                    }
                }
            ]);
            const newState = operationsReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);
            newState.length.should.equal(2);
            
            newState[0].should.deep.equal({
                id: 'message1',
                database: 'MongoDB',
                command: '\"{skip: 0}\"',
                duration: 123,
                operation: 'Insert',
                recordCount: 456
            });

            newState[1].should.deep.equal({
                id: 'message2',
                database: 'MongoDB',
                command: '\"{skip: 0}\"',
                duration: 123,
                operation: 'Delete',
                recordCount: 456
            });
        });
    });
    
    describe('#filtersReducer', () => {
        it('should default to an empty collection of filters', () => {
            const state = undefined;
            const newState = filtersReducer(state, createAction());
            
            should.exist(newState);
            newState.should.deep.equal({});
        });
        
        it('should ignore an unknown action', () => {
            const state: { [key: string]: boolean } = { test: false };
            const newState = filtersReducer(state, createAction());
            
            should.exist(newState);
            newState.should.equal(state);
        });
        
        it('should return the previous state if toggling a non-existant filter', () => {
            const state: { [key: string]: boolean } = {};
            const newState = filtersReducer(state, createAction('request.detail.data.toggle', 'test'));
            
            should.exist(newState);
            newState.should.equal(state);
        });
        
        it('should return an enabled filter if currently disabled', () => {
            const state: { [key: string]: boolean } = { test: false, other: false };
            const newState = filtersReducer(state, createAction('request.detail.data.toggle', 'test'));
            
            should.exist(newState);
            newState.should.deep.equal({
                test: true,
                other: false
            });
        });

        it('should return an disabled filter if currently enabled', () => {
            const state: { [key: string]: boolean } = { test: true, other: true };
            const newState = filtersReducer(state, createAction('request.detail.data.toggle', 'test'));
            
            should.exist(newState);
            newState.should.deep.equal({
                test: false,
                other: true
            });
        });

        it('should return the previous state if already showing all', () => {
            const state: { [key: string]: boolean } = { test: true, other: true };
            const newState = filtersReducer(state, createAction('request.detail.data.all'));
            
            should.exist(newState);
            newState.should.equal(state);
        });

        it('should enable all disabled filters', () => {
            const state: { [key: string]: boolean } = { test: false, other: false };
            const newState = filtersReducer(state, createAction('request.detail.data.all'));
            
            should.exist(newState);
            newState.should.deep.equal({
                test: true,
                other: true
            });
        });
        
        it('should return the previous state if no request is selected', () => {
            const state: { [key: string]: boolean } = { test: false, other: false };
            const newState = filtersReducer(state, createAction('request.detail.update'));
            
            should.exist(newState);
            newState.should.equal(state);
        });
        
        it('should add a MongoDB filter if none yet exists and an insert message exists for the request', () => {
            const state: { [key: string]: boolean } = {};
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'data-mongodb-insert',
                    payload: {
                        options: '{skip: 0}',
                        duration: 123,
                        count: 456
                    }
                }
            ]);
            const newState = filtersReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);
            newState.should.deep.equal({
                MongoDB: true
            });
        });

        it('should add a MongoDB filter if none yet exists and a read message exists for the request', () => {
            const state: { [key: string]: boolean } = {};
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'data-mongodb-read',
                    payload: {
                        options: '{skip: 0}',
                        duration: 123
                    }
                }
            ]);
            const newState = filtersReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);
            newState.should.deep.equal({
                MongoDB: true
            });
        });

        it('should add a MongoDB filter if none yet exists and an update message exists for the request', () => {
            const state: { [key: string]: boolean } = {};
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'data-mongodb-update',
                    payload: {
                        options: '{skip: 0}',
                        duration: 123,
                        modifiedCount: 456,
                        upsertedCount: 654
                    }
                }
            ]);
            const newState = filtersReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);
            newState.should.deep.equal({
                MongoDB: true
            });
        });

        it('should add a MongoDB filter if none yet exists and a delete message exists for the request', () => {
            const state: { [key: string]: boolean } = {};
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'data-mongodb-delete',
                    payload: {
                        options: '{skip: 0}',
                        duration: 123,
                        count: 456
                    }
                }
            ]);
            const newState = filtersReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);
            newState.should.deep.equal({
                MongoDB: true
            });
        });

        it('should return the previous state if a filter associated with a given message already exists', () => {
            const state: { [key: string]: boolean } = { MongoDB: false };
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'data-mongodb-delete',
                    payload: {
                        options: '{skip: 0}',
                        duration: 123,
                        count: 456
                    }
                }
            ]);
            const newState = filtersReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);
            newState.should.equal(state);
        });
    });
});
