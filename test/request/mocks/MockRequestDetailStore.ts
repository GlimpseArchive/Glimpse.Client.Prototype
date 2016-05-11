'use strict';

import { ILoggingComponentState } from '../../../src/request/component-models/ILoggingComponentState';
import { IRequestDetailStore, IRequestDetailState } from '../../../src/request/stores/IRequestDetailStore';

export class MockRequestDetailStore implements IRequestDetailStore {
    public constructor(private _filter?: ILoggingComponentState) {
    }

    public getState(): IRequestDetailState {
        return {
            logging: {
                filter: this._filter
            }
        };
    }
}
