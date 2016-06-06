import { IRequestDetailDataOperationState } from '../stores/IRequestDetailDataOperationState';
import { selectOperationAction, showAllAction, toggleFilterAction } from '../actions/RequestDetailDataActions';
import { requestDetailUpdateAction } from '../actions/RequestDetailActions';

import { CommandAfterExecuteType, ICommandAfterExecutePayload } from '../messages/ICommandAfterExecutePayload';
import { CommandBeforeExecuteType, ICommandBeforeExecutePayload } from '../messages/ICommandBeforeExecutePayload';
import { DataMongoDbDeleteType, IDataMongoDbDeletePayload } from '../messages/IDataMongoDbDeletePayload';
import { DataMongoDbInsertType, IDataMongoDbInsertPayload } from '../messages/IDataMongoDbInsertPayload';
import { DataMongoDbReadType, IDataMongoDbReadPayload } from '../messages/IDataMongoDbReadPayload';
import { DataMongoDbUpdateType, IDataMongoDbUpdatePayload } from '../messages/IDataMongoDbUpdatePayload';
import { IMessage, IMessageEnvelope } from '../messages/IMessageEnvelope';

import { Action, combineReducers } from 'redux';

import * as _ from 'lodash';

const Databases = {
    sql: {
        name: 'SQL',
        messageTypes: [
            CommandBeforeExecuteType,
            CommandAfterExecuteType
        ]
    },
    mongoDb: {
        name: 'MongoDB',
        messageTypes: [
            DataMongoDbInsertType,
            DataMongoDbReadType,
            DataMongoDbUpdateType,
            DataMongoDbDeleteType
        ]
    }
};

interface ISortableOperation {
    ordinal: number;
    operation: IRequestDetailDataOperationState;
}

function updateSelectedIndex(state: string, request) {
    return request ? state : ''; 
}

export function selectedOperationIdReducer(state: string = '', action: Action) {
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
            id: beforeAfterMessage.beforeMessage.id,
            database: Databases.sql.name,
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
        id: message.id,
        database: Databases.mongoDb.name,
        command: prettyPrintJson(message.payload.options),
        duration: message.payload.duration,
        operation: 'Insert',
        recordCount: message.payload.count
    };
}

function createMongoDbReadOperation(message: IMessageEnvelope<IDataMongoDbReadPayload>): IRequestDetailDataOperationState {
    return {
        id: message.id,
        database: Databases.mongoDb.name,
        command: prettyPrintJson(message.payload.options),
        duration: message.payload.duration,
        operation: 'Read',
        recordCount: undefined // NOTE: Read does not have a 'count' property.
    };
}

function createMongoDbUpdateOperation(message: IMessageEnvelope<IDataMongoDbUpdatePayload>): IRequestDetailDataOperationState {
    return {
        id: message.id,
        database: Databases.mongoDb.name,
        command: prettyPrintJson(message.payload.options),
        duration: message.payload.duration,
        operation: 'Update',
        recordCount: message.payload.modifiedCount + message.payload.upsertedCount
    };
}

function createMongoDbDeleteOperation(message: IMessageEnvelope<IDataMongoDbDeletePayload>): IRequestDetailDataOperationState {
    return {
        id: message.id,
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
    return correlateSqlCommands(getMessages(request, CommandBeforeExecuteType), getMessages(request, CommandAfterExecuteType))
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
            .concat(getDataOperations(request, DataMongoDbInsertType, createMongoDbInsertOperation))
            .concat(getDataOperations(request, DataMongoDbReadType, createMongoDbReadOperation))
            .concat(getDataOperations(request, DataMongoDbUpdateType, createMongoDbUpdateOperation))
            .concat(getDataOperations(request, DataMongoDbDeleteType, createMongoDbDeleteOperation))
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

function toggleFilter(state: { [key: string]: boolean }, name: string): { [key: string]: boolean } {
    const filterValue = state[name];
    
    if (filterValue !== undefined) {
        const newState = _.clone(state);
        
        newState[name] = !filterValue;
        
        return newState;       
    }

    return state;
}

function hasMessagesOfType(request, messageType: string) {
    if (request) {
        const messageIds = request.types[messageType];
        
        return messageIds && messageIds.length > 0;
    }
    
    return false;
}

function hasMessagesOfTypes(request, messageTypes: string[]) {
    return _.some(messageTypes, messageType => hasMessagesOfType(request, messageType));
}

function updateFilters(state: { [key: string]: boolean }, request): { [key: string]: boolean } {
    if (request) {
        const existingDatabaseNames = _.values<{ name: string, messageTypes: string[] }>(Databases).filter(databaseType => hasMessagesOfTypes(request, databaseType.messageTypes)).map(dataBaseType => dataBaseType.name);
        
        const newState = _.clone(state);

        let newDatabaseFound = false;
                
        existingDatabaseNames.forEach(name => {
            if (newState[name] === undefined) {
                newState[name] = newDatabaseFound = true;
            }
        });
        
        return newDatabaseFound ? newState : state;
    }
    
    return state;
}

function showAllFilters(state: { [key: string]: boolean }): { [key: string]: boolean } {
    if (_.some(state, filter => !filter)) {
        return _.mapValues(state, filter => true);    
    }
    else {       
        return state;
    }
}

export function filtersReducer(state: { [key: string]: boolean } = {}, action: Action) {
    switch (action.type) {
        case toggleFilterAction.type:
            return toggleFilter(state, toggleFilterAction.unwrap(action));
        case showAllAction.type:
            return showAllFilters(state);
        case requestDetailUpdateAction.type: 
            return updateFilters(state, requestDetailUpdateAction.unwrap(action));
    }
    
    return state;
}

export const requestDetailDataReducer = combineReducers({
    filters: filtersReducer,
    operations: operationsReducer,
    selectedOperationId: selectedOperationIdReducer
});
