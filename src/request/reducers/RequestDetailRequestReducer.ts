import { IRequestDetailRequestMiddlewareState } from '../stores/IRequestDetailRequestMiddlewareState';
import { IRequestDetailRequestState } from '../stores/IRequestDetailRequestState';
import { IMessage, IMessageEnvelope } from '../messages/IMessageEnvelope';
import { IMiddlewareEndPayload, MiddlewareEndType } from '../messages/IMiddlewareEndPayload';
import { IMiddlewareStartPayload, MiddlewareStartType } from '../messages/IMiddlewareStartPayload';
import { IWebRequestPayload, WebRequestType } from '../messages/IWebRequestPayload';
import { IWebResponsePayload, WebResponseType } from '../messages/IWebResponsePayload';
import { requestDetailUpdateAction } from '../actions/RequestDetailActions';

import { Action, combineReducers } from 'redux';
import * as _ from 'lodash';

const defaultMiddlewareState = [];

const defaultState: IRequestDetailRequestState = {
    url: '',
    middleware: defaultMiddlewareState,
    request: {
        body: '',
        formData: {},
        headers: {}
    },
    response: {
        body: '',
        headers: {}
    }
};

// TODO: Consolidate this function into a utility function across reducers.
function getMessages(request, messageType: string): IMessage[] {
    if (request) {
        const messageIds = request.types[messageType];
        
        if (messageIds) {
            return messageIds.map(messageId => request.messages[messageId]);
        }
    }
    
    return [];
}

function getMessageWithPayload<T>(request, messageType: string): IMessageEnvelope<T> {
    if (request) {
        const messageIds = request.types[messageType];
        
        if (messageIds && messageIds.length > 0) {
            return request.messages[messageIds[0]];
        }
    }
    
    return undefined;
}

interface ICorrelatedMiddlewareMessages {
    startMessage: IMessageEnvelope<IMiddlewareStartPayload>;
    endMessage: IMessageEnvelope<IMiddlewareEndPayload>;
    middleware: ICorrelatedMiddlewareMessages[];
}

function correlateMiddlewareMessages(startMessages: IMessageEnvelope<IMiddlewareStartPayload>[], endMessages: IMessageEnvelope<IMiddlewareEndPayload>[]): ICorrelatedMiddlewareMessages[] {
    const endMessagesByCorrelationId = _.keyBy(endMessages, endMessage => endMessage.payload.correlationId);    
    const sortedStartMessages = startMessages.sort((a, b) => a.ordinal - b.ordinal);
    
    const messageStack = [
        {
            startMessage: undefined,
            endMessage: undefined,
            middleware: []
        }
    ];

    sortedStartMessages.forEach(startMessage => {
        const topOfStack = messageStack[messageStack.length - 1];

        while (messageStack[messageStack.length - 1].endMessage && startMessage.ordinal > messageStack[messageStack.length - 1].endMessage.ordinal) {
            messageStack.pop();
        }

        const middleware = {
            startMessage: startMessage,
            endMessage: endMessagesByCorrelationId[startMessage.payload.correlationId],
            middleware: []
        };

        messageStack[messageStack.length - 1].middleware.push(middleware);
        messageStack.push(middleware);
    });

    return messageStack[0].middleware;
}

function toMap<T, TResult>(values: T[], keySelector: (value: T) => string, valueSelector: (value: T) => TResult): { [key: string]: TResult } {

    return _.reduce(
        values, 
        (result: { [key: string]: TResult }, value: T) => {
            result[keySelector(value)] = valueSelector(value);

            return result;
        }, 
        <{ [key: string]: TResult }>{});
}

function createMiddlewareState(messages: ICorrelatedMiddlewareMessages): IRequestDetailRequestMiddlewareState {
    // NOTE: We ignore Express Router header modifications as they're likely actually modifications made by route middleware, not the Router itself.

    return {
        headers: messages.endMessage && messages.startMessage.payload.name !== 'router' ? toMap(messages.endMessage.payload.headers, header => header.name, header => header.value) : {},
        middleware: messages.middleware.map(middlewareMessages => createMiddlewareState(middlewareMessages)),
        name: messages.startMessage.payload.displayName || messages.startMessage.payload.name,
        packageName: messages.startMessage.payload.packageName
    };
}

function updateMiddlewareState(request): IRequestDetailRequestMiddlewareState[] {
    return correlateMiddlewareMessages(getMessages(request, MiddlewareStartType), getMessages(request, MiddlewareEndType)).map(messages => createMiddlewareState(messages));
}

export function middlewareReducer(state: IRequestDetailRequestMiddlewareState[] = defaultMiddlewareState, action: Action): IRequestDetailRequestMiddlewareState[]  {
    switch (action.type) {
        case requestDetailUpdateAction.type:
            return updateMiddlewareState(requestDetailUpdateAction.unwrap(action));
    }

    return state;
}

function createRequestReducer<T>(defaultState: T, reducer: (state: T, requestPayload: IWebRequestPayload, responsePayload: IWebResponsePayload) => T): (state: T, action: Action) => T {
    return (state: T = defaultState, action: Action) => {
        switch (action.type) {
            case requestDetailUpdateAction.type: {
                const request = requestDetailUpdateAction.unwrap(action);
                const requestMessage = getMessageWithPayload<IWebRequestPayload>(request, WebRequestType);
                const responseMessage = getMessageWithPayload<IWebResponsePayload>(request, WebResponseType);

                return reducer(
                    state, 
                    requestMessage ? requestMessage.payload : undefined,
                    responseMessage ? responseMessage.payload : undefined);
            }
        }

        return state;
    }
}

const urlReducer = createRequestReducer<string>(
    '',
    (state, request, response) => {
        return request ? request.url : ''
    });

const webRequestReducer = createRequestReducer<{ body: string, formData: { [key: string]: string }, headers: { [key: string]: string } }>(
    {
        body: '',
        formData: {},
        headers: {}
    },
    (state, request, response) => {
        return {
            body: request && request.body && request.body.content ? request.body.content : '',
            formData: request && request.body && request.body.form ? request.body.form : {}, 
            headers: request && request.headers ? request.headers : {}
        }
    });

const webResponseReducer = createRequestReducer<{ body: string, headers: { [key: string]: string } }>(
    {
        body: '',
        headers: {}
    },
    (state, request, response) => {
        return {
            body: response && response.body && response.body.content ? response.body.content : '',
            headers: response && response.headers ? response.headers : {}
        }
    });

export const requestReducer = combineReducers({
    middleware: middlewareReducer,
    request: webRequestReducer,
    response: webResponseReducer,
    url: urlReducer
});
