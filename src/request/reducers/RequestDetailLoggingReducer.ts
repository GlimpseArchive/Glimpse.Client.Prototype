import { IRequestDetailLoggingFilterState } from '../stores/IRequestDetailLoggingFilterState';
import { IRequestDetailLoggingMessageState } from '../stores/IRequestDetailLoggingMessageState';
import { IRequestDetailLoggingState } from '../stores/IRequestDetailLoggingState';
import { requestDetailUpdateAction } from '../actions/RequestDetailActions';
import { showAllAction, toggleLevelAction } from '../actions/RequestDetailLoggingActions';

import { Action, combineReducers } from 'redux';

import * as _ from 'lodash';

function updateFilter(filtersState: IRequestDetailLoggingFilterState[], filterIndex: number): IRequestDetailLoggingFilterState[] {
    
    const filterState = filtersState[filterIndex];
    const updatedFiltersState = filtersState.slice();
    
    updatedFiltersState[filterIndex] = {
        level: filterState.level,
        isShown: !filterState.isShown
    };
    
    return updatedFiltersState;
}

function toggleLevel(filtersState: IRequestDetailLoggingFilterState[], filterIndex: number): IRequestDetailLoggingFilterState[] {
    return updateFilter(filtersState, filterIndex);
}

function showAll(filtersState: IRequestDetailLoggingFilterState[]): IRequestDetailLoggingFilterState[]
{
    if (_.some(filtersState, filter => !filter.isShown)) {
        return filtersState.map(filterState => {
            return {
                level: filterState.level,
                isShown: true
            };
        });
    }
    
    return filtersState;
}

function indexOf(value: string, term: string, window: number) {
    for (let i = 0; i < value.length && i < window; i++) {
        if (value[i] === term) {
            return i;
        }
    }
    
    return -1;
}

function lastIndexOf(value: string, term: string, window: number) {
    const lastWindowIndex = value.length - window;
    
    for (let i = value.length - 1; i >= 0 && i >= lastWindowIndex; i--) {
        if (value[i] === term) {
            return i;
        }
    }
    
    return -1;
}

export function isMessageObject(message: string): boolean {
    const OBJECT_BRACE_WINDOW = 64;

    //
    // NOTE: Our heuristic for determining whether text represents an object rather simplistic 
    //       (to minimize impact on performance). We simply look for starting and ending braces
    //       (i.e. '{' and '}') near the beginning and ending of the text, respectively, allowing 
    //       for whitespace and other text that might pre-fix/post-fix the actual object.
    //
    
    if (message) {
        const length = message.length;

        if (length > 0) {
            const startIndex = indexOf(message, '{', OBJECT_BRACE_WINDOW);
            const lastIndex = lastIndexOf(message, '}', OBJECT_BRACE_WINDOW);
            
            if (startIndex >= 0 && lastIndex >= 0 && startIndex < lastIndex) {
                return true;
            }
        }
    }
    
    return false;
}

export function createSpans(message: string, replacedRegions: ({ start: number, end: number })[]): ({ text: string, wasReplaced?: boolean })[] {
    if (!message || message.length === 0) {
        return [{ text: '' }];
    }

    replacedRegions = _.sortBy(replacedRegions || [], region => region.start);

    let messageIndex = 0;
    const messageStructure = [];

    for (let i = 0; i < replacedRegions.length; i++) {
        const region = replacedRegions[i];

        if (region.start < 0 || region.start >= message.length) {
            console.warn('The region [%d,%d) exceeds the bounds of the log message (length === %d).', region.start, region.end, message.length);

            continue;
        }

        if (region.end < 0 || region.end > message.length) {
            console.warn('The region [%d,%d) exceeds the bounds of the log message (length === %d).', region.start, region.end, message.length);

            continue;
        }

        if (region.end < region.start) {
            console.warn('The region [%d,%d) is not a contiguous span in the log message (length === %d).', region.start, region.end, message.length);

            continue;
        }

        if (region.start < messageIndex) {
            console.warn('The region [%d,%d) overlaps a previous span in the log message (length === %d).', region.start, region.end, message.length);

            continue;
        }

        if (region.start === region.end) {
            // Ignore zero-length regions (to prevent creating three spans when one will do).

            continue;
        }

        if (messageIndex < region.start) {
            messageStructure.push({ text: message.substring(messageIndex, region.start) });
        }

        messageStructure.push({ text: message.substring(region.start, region.end), wasReplaced: true });

        messageIndex = region.end;
    }

    if (messageIndex < message.length) {
        messageStructure.push({ text: message.substring(messageIndex, message.length) });
    }

    return messageStructure;
}

function updateMessagesState(messagesState: IRequestDetailLoggingMessageState[], request): IRequestDetailLoggingMessageState[] {
    if (request && request.messages && request.types) {
        const logWriteMessageIds = request.types['log-write'];

        if (logWriteMessageIds) {

            const allMessages = _(logWriteMessageIds)
                .map(id => request.messages[id])
                .filter(message => message !== undefined)
                .sortBy('ordinal')
                .map(message => {
                    return { 
                        level: message.payload.level, 
                        message: message.payload.message,
                        isObject: isMessageObject(message.payload.message),
                        spans: createSpans(message.payload.message, message.payload.replacedRegions) };
                })
                .value();

            return allMessages;
        }
    }

    return [];
}

const defaultState = [
    { level: 'Critical', isShown: true },
    { level: 'Error', isShown: true },
    { level: 'Warning', isShown: true },
    { level: 'Information', isShown: true },
    { level: 'Verbose', isShown: true },
    { level: 'Debug', isShown: true }
];

export function filtersReducer(state: IRequestDetailLoggingFilterState[] = defaultState, action: Action) {
    switch (action.type) {
       case toggleLevelAction.type:
            return toggleLevel(state, toggleLevelAction.unwrap(action));
        case showAllAction.type:
            return showAll(state);
    }

    return state;
}

export function messagesReducer(state: IRequestDetailLoggingMessageState[] = [], action: Action): IRequestDetailLoggingMessageState[] {
    switch (action.type) {
        case requestDetailUpdateAction.type:
            return updateMessagesState(state, requestDetailUpdateAction.unwrap(action));    
    }
    
    return state;
}

export const loggingReducer = combineReducers({
    messages: messagesReducer,
    filters: filtersReducer
});