'use strict';

import { IComponentModel } from './IComponentModel';
import { ILogMessage } from '../messages/ILogMessage';
import { IOffsetMessage } from '../messages/IOffsetMessage';

export interface ILoggingComponentMessage extends ILogMessage, IOffsetMessage {
}

export interface ILoggingComponentModel extends IComponentModel {
    messages: ILoggingComponentMessage[];
}
