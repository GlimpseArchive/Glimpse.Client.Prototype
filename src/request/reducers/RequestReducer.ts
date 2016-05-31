import { requestDetailReducer } from './RequestDetailReducer'

import { combineReducers } from 'redux';

export const requestReducer = combineReducers({
    detail: requestDetailReducer
});
