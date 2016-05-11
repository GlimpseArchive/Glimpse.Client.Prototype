'use strict';

import { ILoggingComponentState } from '../component-models/ILoggingComponentState';

export interface IRequestDetailLoggingState {
    filter: ILoggingComponentState;
}

export interface IRequestDetailState {
    logging: IRequestDetailLoggingState;
}

export interface IRequestDetailStore {
    getState(): IRequestDetailState;
}
