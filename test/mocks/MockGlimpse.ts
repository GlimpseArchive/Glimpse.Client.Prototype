'use strict';

import { IGlimpse } from '../../src/IGlimpse';

export class MockGlimpse implements IGlimpse {
    public emitted: ({ eventName: string, eventData })[] = [];

    public emit(eventName: string, eventData): void {
        this.emitted.push({
            eventName: eventName,
            eventData: eventData
        });
    }
}
