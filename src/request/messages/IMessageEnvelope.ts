'use strict';

export interface IMessage {
    id: string;
    ordinal: number;
    types: string[];
    payload;
}

export interface IMessageEnvelope<T> extends IMessage {
    payload: T;
}
