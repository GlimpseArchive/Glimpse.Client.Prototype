'use strict';

/*tslint:disable:no-var-requires */
const messageProcessor = require('../util/request-message-processor');
/*tslint:enable:no-var-requires */

import { ILoggingComponentMessage, ILoggingComponentModel } from './ILoggingComponentModel';
import { IMessageEnvelope } from '../messages/IMessageEnvelope';

import _ = require('lodash');

export class LoggingComponentModel implements ILoggingComponentModel {
    private static getList = messageProcessor.getTypeMessageList;

    private static options = {
        'log-write': LoggingComponentModel.getList
    };

    private _messages: ILoggingComponentMessage[];

    public get messages() {
        return this._messages;
    }

    public init(request) {
        const allMessages = messageProcessor.getTypeStucture(request, LoggingComponentModel.options);

        if (allMessages) {
            this._messages = _(allMessages.logWrite)
                .sortBy<IMessageEnvelope<ILoggingComponentMessage>>('ordinal')
                .map(message => message.payload)
                .value();
        }
        else {
            this._messages = [];
        };
    }
}
