import { IRequestState } from '../stores/IRequestState';

import { createSelector } from 'reselect';

import * as _ from 'lodash';

export const getRequest = (state: IRequestState) => state.detail.request;

function getContentTypeFromHeaders(headers: { [key: string]: string }): string {
    let contentType = undefined;

    _.forEach(headers, (value, key) => {
        if (key.toLowerCase() === 'content-type') {
            contentType = value;
            
            return false;
        }
    });

    return contentType;
}

export const getRequestContentType = createSelector(
    getRequest,
    request => {
        return getContentTypeFromHeaders(request.request.headers);
    });

export const getResponseContentType = createSelector(
    getRequest,
    request => {
        return getContentTypeFromHeaders(request.response.headers);
    });
