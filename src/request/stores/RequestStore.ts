import { requestReducer } from '../reducers/RequestReducer';

import { createStore } from 'redux';

export = createStore(requestReducer);
