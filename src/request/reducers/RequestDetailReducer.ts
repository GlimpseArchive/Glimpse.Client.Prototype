import { loggingReducer } from './RequestDetailLoggingReducer';
import { requestDetailDataReducer } from './RequestDetailDataReducer'
import { webServicesReducer } from './RequestDetailWebServicesReducer';

import { combineReducers } from 'redux';

export const requestDetailReducer = combineReducers({
    data: requestDetailDataReducer,
    logging: loggingReducer,
    webServices: webServicesReducer
});
