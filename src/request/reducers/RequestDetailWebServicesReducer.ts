import { DataHttpRequestType, IDataHttpRequestPayload } from '../messages/IDataHttpRequestPayload';
import { DataHttpResponseType, IDataHttpResponsePayload } from '../messages/IDataHttpResponsePayload';
import { IMessage, IMessageEnvelope } from '../messages/IMessageEnvelope';
import { IRequestDetailWebServicesRequestState } from '../stores/IRequestDetailWebServicesRequestState';
import { requestDetailUpdateAction } from '../actions/RequestDetailActions';
import { selectRequestAction } from '../actions/RequestDetailWebServicesActions';

import { Action, combineReducers } from 'redux';

import * as _ from 'lodash';

// TODO: Consolidate this function into a utility function across reducers.
function getMessages(request, messageType: string): IMessage[] {
    const messageIds = request.types[messageType];
    
    if (messageIds) {
        return messageIds.map(messageId => request.messages[messageId]);
    }
    
    return [];
}

function correlateMessages(requestMessages: IMessageEnvelope<IDataHttpRequestPayload>[], responseMessages: IMessageEnvelope<IDataHttpResponsePayload>[]): 
    { requestMessage: IMessageEnvelope<IDataHttpRequestPayload>, responseMessage: IMessageEnvelope<IDataHttpResponsePayload> }[] {

    // NOTE: We assume requests are always followed by their respective reponse.

    if (requestMessages.length === responseMessages.length) {
        var sortedRequestMessages = _.sortBy(requestMessages, message => message.ordinal);
        var sortedResponseMessages = _.sortBy(responseMessages, message => message.ordinal);

        return sortedRequestMessages.map((requestMessage, index) => {
            return {
                requestMessage: requestMessage,
                responseMessage: sortedResponseMessages[index]
            };
        });
    }

    return [];
} 

function createRequestState(messages: { requestMessage: IMessageEnvelope<IDataHttpRequestPayload>, responseMessage: IMessageEnvelope<IDataHttpResponsePayload> }): IRequestDetailWebServicesRequestState {
    return {
        id: messages.requestMessage.id,
        ordinal: messages.requestMessage.ordinal,
        url: messages.requestMessage.payload.url,
        statusCode: messages.responseMessage.payload.statusCode,
        method: messages.requestMessage.payload.method,
        requestHeaders: messages.requestMessage.payload.headers,
        responseHeaders: messages.responseMessage.payload.headers
    };
}

function updateRequests(state: { [key: string]: IRequestDetailWebServicesRequestState }, request): { [key: string]: IRequestDetailWebServicesRequestState } {
    if (request) {
        return _(correlateMessages(
                getMessages(request, DataHttpRequestType),
                getMessages(request, DataHttpResponseType)))
            .map(createRequestState)
            .keyBy(request => request.id)
            .value();
    }

    return {};
}

export function requestsReducer(state: { [key: string]: IRequestDetailWebServicesRequestState } = {}, action: Action) {
    switch (action.type) {
        case requestDetailUpdateAction.type:
            return updateRequests(state, requestDetailUpdateAction.unwrap(action));
    }

    return state;
}

export function selectedRequestIdReducer(state: string = '', action: Action) {
    switch (action.type) {
        case selectRequestAction.type:
            return selectRequestAction.unwrap(action);
        case requestDetailUpdateAction.type:
            return '';
    }

    return state;
}

export const webServicesReducer = combineReducers({
    requests: requestsReducer,
    selectedRequestId: selectedRequestIdReducer
});
