'use strict';

import { IComponentModel } from './IComponentModel';
import { ILogMessage } from '../messages/ILogMessage';

export interface ILoggingComponentModel extends IComponentModel {
    messages: ILogMessage[];
}
