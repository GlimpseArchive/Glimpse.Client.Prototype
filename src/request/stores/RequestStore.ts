import { requestReducer } from '../reducers/RequestReducer';

import { createStore } from 'redux';

export = createStore(requestReducer,
    DEV_TOOLS && window.devToolsExtension && window.devToolsExtension());
