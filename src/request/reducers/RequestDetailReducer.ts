import { loggingReducer } from './RequestDetailLoggingReducer';
import { requestDetailDataReducer } from './RequestDetailDataReducer'
import { requestReducer } from './RequestDetailRequestReducer';
import { webServicesReducer } from './RequestDetailWebServicesReducer';

import { combineReducers } from 'redux';

export const requestDetailReducer = combineReducers({
    data: requestDetailDataReducer,
    logging: loggingReducer,
    request: requestReducer,
    webServices: webServicesReducer
});
