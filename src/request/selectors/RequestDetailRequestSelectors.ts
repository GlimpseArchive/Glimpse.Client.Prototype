import { IRequestState } from '../stores/IRequestState';
import { IRequestDetailRequestState } from '../stores/IRequestDetailRequestState';
import { IRequestDetailRequestMiddlewareState } from '../stores/IRequestDetailRequestMiddlewareState';

import { createSelector } from 'reselect';

import * as _ from 'lodash';

const getMiddlewareState = (state: IRequestState) => state.detail.request.middleware;
export const getRequest = (state: IRequestState) => state.detail.request;
export const getUrl = (state: IRequestState) => state.detail.request.url;

interface IFlattenedMiddleware {
    depth: number,
    middleware: { name: string, packageName: string, headers: { [key: string]: string } }
}

function flattenMiddlewareRecursive(middleware: IRequestDetailRequestMiddlewareState[], middlewareArray: IFlattenedMiddleware[], depth: number): void {

    middleware.forEach(middlewareItem => {
        middlewareArray.push({
            depth: depth,
            middleware: {
                name: middlewareItem.name,
                packageName: middlewareItem.packageName,
                headers: middlewareItem.headers
            }
        });

        flattenMiddlewareRecursive(middlewareItem.middleware, middlewareArray, depth + 1);
    });
}

function flattenMiddleware(middleware: IRequestDetailRequestMiddlewareState[]): IFlattenedMiddleware[] {
    const middlewareArray = [];

    flattenMiddlewareRecursive(middleware, middlewareArray, 0);

    return middlewareArray;
}

export const getMiddleware = createSelector(
    getMiddlewareState,
    middleware => {
        return flattenMiddleware(middleware);
    }
);

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
