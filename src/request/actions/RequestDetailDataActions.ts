import { createActionCreator, createSimpleActionCreator } from './ActionCreator';

import { Action } from 'redux';

export const selectOperationAction = createActionCreator<string>('request.detail.data.select');

export const toggleFilterAction = createActionCreator<string>('request.detail.data.toggle');

export const showAllAction = createSimpleActionCreator('request.detail.data.all');
