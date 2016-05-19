'use strict';

import { IComponentModel } from './IComponentModel';
import { ILogMessage } from '../messages/ILogMessage';

export interface ILogMessageSpan {
    text: string;
    wasReplaced?: boolean;
}

export interface ILogMessageModel extends ILogMessage {
    id: string;
    isObject: boolean;
    ordinal: number;
    spans: ILogMessageSpan[];
}

export interface ILoggingLevelModel {
    level: string;
    messageCount: number;
}

export interface ILoggingComponentModel extends IComponentModel {
    levels: ILoggingLevelModel[];
    totalMessageCount: number;

    getMessages(): ILogMessageModel[];

    isShown(level: ILoggingLevelModel): boolean;

    showAll(): void;
    toggleLevel(level: ILoggingLevelModel): void;
}
