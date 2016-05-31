import { IRequestDetailDataOperationState } from '../stores/IRequestDetailDataOperationState';
import { selectOperationAction } from '../actions/RequestDetailDataActions';
import { requestDetailUpdateAction } from '../actions/RequestDetailActions';

import { ICommandAfterExecutePayload } from '../messages/ICommandAfterExecutePayload';
import { ICommandBeforeExecutePayload } from '../messages/ICommandBeforeExecutePayload';
import { IDataMongoDbDeletePayload } from '../messages/IDataMongoDbDeletePayload';
import { IDataMongoDbInsertPayload } from '../messages/IDataMongoDbInsertPayload';
import { IDataMongoDbReadPayload } from '../messages/IDataMongoDbReadPayload';
import { IDataMongoDbUpdatePayload } from '../messages/IDataMongoDbUpdatePayload';
import { IMessage, IMessageEnvelope } from '../messages/IMessageEnvelope';

import { Action, combineReducers } from 'redux';

import * as _ from 'lodash';

interface ISortableOperation {
    ordinal: number;
    operation: IRequestDetailDataOperationState;
}

function updateSelectedIndex(state: number, request) {
    return request
        ? state
        : 0; 
}

export function selectedIndexReducer(state: number = 0, action: Action) {
    switch (action.type) {
        case selectOperationAction.type:
            return selectOperationAction.unwrap(action);            
        case requestDetailUpdateAction.type:
            return updateSelectedIndex(state, requestDetailUpdateAction.unwrap(action));
    }
    
    return state;
}

function correlateSqlCommands(beforeMessages: IMessageEnvelope<ICommandBeforeExecutePayload>[], afterMessages: IMessageEnvelope<ICommandAfterExecutePayload>[]): ({ beforeMessage: IMessageEnvelope<ICommandBeforeExecutePayload>, afterMessage: IMessageEnvelope<ICommandAfterExecutePayload> })[] {
    // NOTE: This is a particularly naive implementation. If no after-message actually exists for a given 
    //       before-message but another later after-message does exist, that will be paired to the before-message 
    //       instead.
    
    const sortedAfterMessages = afterMessages.sort((a, b) => a.ordinal - b.ordinal);
    
    return beforeMessages.map(beforeMessage => {
        const afterMessage = _.find(sortedAfterMessages, message => message.ordinal > beforeMessage.ordinal);
        
        return {
            beforeMessage: beforeMessage,
            afterMessage: afterMessage
        }
    });
}

function getOperationForSqlCommand(commandMethod: string): string {
    switch (commandMethod) {
        case 'ExecuteReader':
            return 'Read';
        default:
            return commandMethod;
    }
}

function createSqlOperation(beforeAfterMessage: { beforeMessage: IMessageEnvelope<ICommandBeforeExecutePayload>, afterMessage: IMessageEnvelope<ICommandAfterExecutePayload> }): ISortableOperation {
    return {
        ordinal: beforeAfterMessage.beforeMessage.ordinal,
        operation: {
            database: 'SQL',
            command: beforeAfterMessage.beforeMessage.payload.commandText,
            duration: beforeAfterMessage.afterMessage ? beforeAfterMessage.afterMessage.payload.commandDuration : undefined,
            operation: getOperationForSqlCommand(beforeAfterMessage.beforeMessage.payload.commandMethod),
            recordCount: undefined // NOTE: SQL does not track record counts.
        }
    }
}

function prettyPrintJson(value): string {
    return JSON.stringify(value, null, 4);
}

function createMongoDbInsertOperation(message: IMessageEnvelope<IDataMongoDbInsertPayload>): IRequestDetailDataOperationState {
    return {
        database: 'MongoDB',
        command: prettyPrintJson(message.payload.options),
        duration: message.payload.duration,
        operation: 'Insert',
        recordCount: message.payload.count
    };
}

function createMongoDbReadOperation(message: IMessageEnvelope<IDataMongoDbReadPayload>): IRequestDetailDataOperationState {
    return {
        database: 'MongoDB',
        command: prettyPrintJson(message.payload.options),
        duration: message.payload.duration,
        operation: 'Read',
        recordCount: undefined // NOTE: Read does not have a 'count' property.
    };
}

function createMongoDbUpdateOperation(message: IMessageEnvelope<IDataMongoDbUpdatePayload>): IRequestDetailDataOperationState {
    return {
        database: 'MongoDB',
        command: prettyPrintJson(message.payload.options),
        duration: message.payload.duration,
        operation: 'Update',
        recordCount: message.payload.modifiedCount + message.payload.upsertedCount
    };
}

function createMongoDbDeleteOperation(message: IMessageEnvelope<IDataMongoDbDeletePayload>): IRequestDetailDataOperationState {
    return {
        database: 'MongoDB',
        command: prettyPrintJson(message.payload.options),
        duration: message.payload.duration,
        operation: 'Delete',
        recordCount: message.payload.count
    };
}

function getMessages(request, messageType: string): IMessage[] {
    const messageIds = request.types[messageType];
    
    if (messageIds) {
        return messageIds.map(messageId => request.messages[messageId]);
    }
    
    return [];
}

function getSqlOperations(request): ISortableOperation[] {
    return correlateSqlCommands(getMessages(request, 'before-execute-command'), getMessages(request, 'after-execute-command'))
        .map(createSqlOperation);   
}

function getDataOperations(request, messageType: string, selector: (message: IMessage) => IRequestDetailDataOperationState): ISortableOperation[] {
    return getMessages(request, messageType).map(message => {
        return { 
            ordinal: message.ordinal, operation: selector(message) 
        }
    });
}

function updateOperations(state: IRequestDetailDataOperationState[], request): IRequestDetailDataOperationState[] {
    if (request) {
        const allOperations: ISortableOperation[] = [];
        
        return allOperations
            .concat(getSqlOperations(request))
            .concat(getDataOperations(request, 'data-mongodb-insert', createMongoDbInsertOperation))
            .concat(getDataOperations(request, 'data-mongodb-read', createMongoDbReadOperation))
            .concat(getDataOperations(request, 'data-mongodb-update', createMongoDbUpdateOperation))
            .concat(getDataOperations(request, 'data-mongodb-delete', createMongoDbDeleteOperation))
            .sort((a, b) => a.ordinal - b.ordinal)
            .map(operation => operation.operation);
    }
    
    return [];
}

export function operationsReducer(state: IRequestDetailDataOperationState[] = [], action: Action): IRequestDetailDataOperationState[] {
    switch (action.type) {
        case requestDetailUpdateAction.type: 
            return updateOperations(state, requestDetailUpdateAction.unwrap(action));
    }
    
    return state;
}

export const requestDetailDataReducer = combineReducers({
    operations: operationsReducer,
    selectedIndex: selectedIndexReducer
});
