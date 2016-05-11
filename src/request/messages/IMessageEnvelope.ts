'use strict';

export interface IMessage {
    id: string;
    ordinal: number;
    payload;
}

export interface IMessageEnvelope<T> extends IMessage {
    payload: T;
}
