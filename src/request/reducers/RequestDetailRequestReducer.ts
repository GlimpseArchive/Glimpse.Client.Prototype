import { IRequestDetailRequestState } from '../stores/IRequestDetailRequestState';
import { IMessageEnvelope } from '../messages/IMessageEnvelope';
import { IWebRequestPayload, WebRequestType } from '../messages/IWebRequestPayload';
import { IWebResponsePayload, WebResponseType } from '../messages/IWebResponsePayload';
import { requestDetailUpdateAction } from '../actions/RequestDetailActions';

import { Action } from 'redux';

const defaultState: IRequestDetailRequestState = {
    url: '',
    requestHeaders: {},
    responseHeaders: {}
};

// TODO: Consolidate this function into a utility function across reducers.
function getMessageWithPayload<T>(request, messageType: string): IMessageEnvelope<T> {
    const messageIds = request.types[messageType];
    
    if (messageIds && messageIds.length > 0) {
        return request.messages[messageIds[0]];
    }
    
    return undefined;
}

function updateRequestState(state: IRequestDetailRequestState, request): IRequestDetailRequestState {
    if (request) {
        const requestMessage = getMessageWithPayload<IWebRequestPayload>(request, WebRequestType);
        const responseMessage = getMessageWithPayload<IWebResponsePayload>(request, WebResponseType);

        return {
            url: requestMessage ? requestMessage.payload.url : undefined,
            requestHeaders: requestMessage ? requestMessage.payload.headers : undefined,
            responseHeaders: responseMessage ? responseMessage.payload.headers : undefined
        };
    }

    return defaultState;
}

export function requestReducer(state: IRequestDetailRequestState = defaultState, action: Action) {
    switch (action.type) {
        case requestDetailUpdateAction.type:
            return updateRequestState(state, requestDetailUpdateAction.unwrap(action));
    }

    return state;
}
