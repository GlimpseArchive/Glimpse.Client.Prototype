import { createActionCreator } from './ActionCreator';

import { Action } from 'redux';

export const selectRequestAction = createActionCreator<string>('request.detail.webServices.select');
