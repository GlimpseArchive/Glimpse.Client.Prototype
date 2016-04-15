'use strict';

export interface IMessage {
    ordinal: number;
    payload;
}

export interface IMessageEnvelope<T> extends IMessage {
    payload: T;
}
