import { IRequestState } from '../stores/IRequestState';

import { createSelector } from 'reselect';

export const getOperations = (state: IRequestState) => state.detail.data.operations;
export const getSelectedIndex = (state: IRequestState) => state.detail.data.selectedIndex;

export const getTotalOperationCount = createSelector(
    getOperations,
    operations => {
        return operations.length;
    });

export const getSelectedOperation = createSelector(
    getOperations,
    getSelectedIndex,
    (operations, selectedIndex) => {
        return operations[selectedIndex];
    });
