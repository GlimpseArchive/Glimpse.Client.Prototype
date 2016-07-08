import { requestReducer } from '../reducers/RequestReducer';

import { createStore } from 'redux';

const store = DEV_TOOLS && window.devToolsExtension
    ? createStore(requestReducer, window.devToolsExtension())
    : createStore(requestReducer);

export = store;
