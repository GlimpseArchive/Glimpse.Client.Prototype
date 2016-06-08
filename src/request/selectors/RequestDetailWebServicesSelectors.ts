import { IRequestDetailWebServicesRequestState } from '../stores/IRequestDetailWebServicesRequestState';
import { IRequestState } from '../stores/IRequestState';

import { createSelector } from 'reselect';
import * as _ from 'lodash';

const getRequests = (state: IRequestState) => state.detail.webServices.requests;
const getSelectedRequestId = (state: IRequestState) => state.detail.webServices.selectedRequestId;

export const getRequestsByOrdinal = createSelector(
    getRequests,
    requests => {
        return _(requests)
            .values<IRequestDetailWebServicesRequestState>()
            .sortBy(request => request.ordinal)
            .value();
    });

export const getSelectedRequest = createSelector(
    getRequests,
    getRequestsByOrdinal,
    getSelectedRequestId,
    (requests, requestsByOrdinal, selectedRequestId) => {
        return selectedRequestId !== '' ? requests[selectedRequestId] : requestsByOrdinal[0];
    });
