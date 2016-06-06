import { IRequestState } from '../stores/IRequestState';

import { createSelector } from 'reselect';

import * as _ from 'lodash';

const getFiltersState = (state: IRequestState) => state.detail.logging.filters;
const getMessages = (state: IRequestState) => state.detail.logging.messages;

export const getFilters = createSelector(
    getMessages,
    getFiltersState,
    (messages, filters) => {
        const levels = _.groupBy(messages, message => message.level);

        return filters.map(filter => {
            const level = levels[filter.level];
            
            return {
                name: filter.level,
                count: level ? level.length : 0,
                isShown: filter.isShown
            };
        });
    });

export const getFilteredMessages = createSelector(
    getMessages, 
    getFiltersState,
    (messages, filters) => {
        const hiddenLevels = filters
            .filter(filterState => filterState.isShown === false)
            .map(filterState => filterState.level);
        
        let filteredMessages = [];
        
        messages.forEach((messageState, index) => {
            if (!_.includes(hiddenLevels, messageState.level)) {
                filteredMessages.push({ index: index + 1, message: messageState });
            }
        })
        
        return filteredMessages;
    });

export const getTotalMessageCount = createSelector(
    getMessages,
    (messages) => {
        return messages.length;
    });
