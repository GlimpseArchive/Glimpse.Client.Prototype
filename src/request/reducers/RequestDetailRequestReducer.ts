import { IRequestDetailRequestState } from '../stores/IRequestDetailRequestState';
import { IMessageEnvelope } from '../messages/IMessageEnvelope';
import { IWebRequestPayload, WebRequestType } from '../messages/IWebRequestPayload';
import { IWebResponsePayload, WebResponseType } from '../messages/IWebResponsePayload';
import { requestDetailUpdateAction } from '../actions/RequestDetailActions';

import { Action } from 'redux';

const defaultState: IRequestDetailRequestState = {
    url: '',
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
            request: {
                body: requestMessage && requestMessage.payload.body && requestMessage.payload.body.content ? requestMessage.payload.body.content : '',
                formData: requestMessage && requestMessage.payload.body && requestMessage.payload.body.form ? requestMessage.payload.body.form : {}, 
                headers: requestMessage ? requestMessage.payload.headers : {}
            },
            response: {
                body: responseMessage && responseMessage.payload.body && responseMessage.payload.body.content ? responseMessage.payload.body.content : '',
                headers: responseMessage ? responseMessage.payload.headers : {}
            }
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
