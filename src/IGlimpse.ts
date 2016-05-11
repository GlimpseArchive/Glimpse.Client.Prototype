'use strict';

export interface IGlimpse {
    emit(eventName: string, eventData): void;
}
