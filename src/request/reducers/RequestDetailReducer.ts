import { requestDetailDataReducer } from './RequestDetailDataReducer'

import { combineReducers } from 'redux';

export const requestDetailReducer = combineReducers({
    data: requestDetailDataReducer
});
