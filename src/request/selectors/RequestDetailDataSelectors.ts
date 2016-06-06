import { IRequestState } from '../stores/IRequestState';

import { createSelector } from 'reselect';
import * as _ from 'lodash';

export const getFilterState = (state: IRequestState) => state.detail.data.filters;
export const getOperations = (state: IRequestState) => state.detail.data.operations;
export const getSelectedOperationIdState = (state: IRequestState) => state.detail.data.selectedOperationId;

export const getTotalOperationCount = createSelector(
    getOperations,
    operations => {
        return operations.length;
    });

export const getFilteredOperations = createSelector(
    getFilterState,
    getOperations,
    (filterState, operations) => {
        let filteredOperations = [];
        
        operations.forEach((operation, index) => {
            if (filterState[operation.database]) {
                filteredOperations.push({
                    ordinal: index + 1,
                    operation: operation
                })
            }
        });
        
        return filteredOperations;
    });

export const getSelectedOperationId = createSelector(
    getFilteredOperations,
    getSelectedOperationIdState,
    (operations, selectedOperationIdState) => {       
        return selectedOperationIdState === '' && operations.length > 0 
            ? operations[0].operation.id 
            : selectedOperationIdState;
    });

export const getSelectedOperation = createSelector(
    getFilteredOperations,
    getSelectedOperationId,
    (operations, selectedOperationId) => {
        // TODO: Can this (need this) be optimized by building a map of id --> operation?
        return _.find(operations, operation => operation.operation.id === selectedOperationId);
    });

export const getFilters = createSelector(
    getFilterState,
    getOperations,
    (filterState, operations) => {
        var databases = _.groupBy(operations, operation => operation.database);
        
        return _(filterState)
            .mapValues((filter, database) => {
                const databaseOperations = databases[database];
                
                return {
                    name: database,
                    isShown: filter,
                    count: databaseOperations ? databaseOperations.length : 0
                };
            })
            .values<{ name: string, isShown: boolean, count: number }>()
            .sortBy(filter => filter.name)
            .value();
    });
