import { createActionCreator, createSimpleActionCreator } from './ActionCreator';

import { Action } from 'redux';

export const showAllAction = createSimpleActionCreator('request.detail.logging.all');

export const toggleLevelAction = createActionCreator<number>('request.detail.logging.toggle');
