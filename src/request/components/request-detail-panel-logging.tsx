'use strict';

import { FontAwesomeIcon } from '../../shell/components/FontAwesomeIcon';
import { ILogMessage } from '../messages/ILogMessage';
import { ILoggingComponentModel, ILoggingLevelModel } from '../component-models/ILoggingComponentModel';

import _ = require('lodash');
import React = require('react');

export interface ILoggingProps {
    componentModel: ILoggingComponentModel;
}

/**
 * React class to for the console log messages tab
 */
export class Logging extends React.Component<ILoggingProps, {}> {
    public render() {
        const totalMessages = this.props.componentModel.totalMessageCount;

        if (totalMessages !== 0) {
            const messages = this.props.componentModel.getMessages();
            return (
                <div className='tab-content tab-logs'>
                    <div className='tab-logs-message-count'>{totalMessages} {totalMessages === 1 ? 'Message' : 'Messages'}</div>
                    <br/>
                    <div className='flex filter-bar'>
                        <button className='filter-show-all' onClick={e => this.toggleAll()}>Show All</button>
                        <div className='flex'>
                        {
                            this.props.componentModel.levels.map(
                                level => {
                                    return <button className={this.props.componentModel.isShown(level) ? 'filter-button-shown' : 'filter-button-not-shown'} type='button' onClick={e => this.toggleLevel(level)}>{level.level} ({level.messageCount})</button>;
                                })
                        }
                        </div>
                    </div>
                    <br/>
                    <table className='table table-bordered table-striped tab-content-item'>
                        <thead>
                            <tr className='table-col-title-group'>
                                <th width='5%'><span className='table-col-title'>Ordinal</span></th>
                                <th width='10%'><span className='table-col-title'><FontAwesomeIcon path=''/>Level</span></th>
                                <th width='40%'><span className='table-col-title'>Message</span></th>
                                <th width='10%'><span className='table-col-title'>From Start</span></th>
                                <th width='10%'><span className='table-col-title'>Duration</span></th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                        {
                            messages.map(message => {
                                return (
                                    <tr className='tab-logs-data-default' key={message.id}>
                                        <td>{message.ordinal}</td>
                                        <td className={Logging.getRowClass(message)}><FontAwesomeIcon path={Logging.getIconPath(message.level)} />{message.level}</td>
                                        <td>{message.spans.map(span => <span className={span.wasReplaced ? 'tab-logs-data-replaced-region' : ''}>{span.text}</span>)}</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td />
                                    </tr>);
                            })
                        }
                        </tbody>
                        <tfoot>
                            <tr className='table-body-padding table-col-title-group'><th colSpan='6'></th></tr>
                        </tfoot>
                    </table>
                </div>
            );
        }
        else {
            return <div className='tab-section text-minor'>Could not find any data.</div>;
        }
    }

    private static getIconPath(level: string) {
        switch (level) {
            case 'Critical':
            case 'Error':
                return FontAwesomeIcon.paths.TimesCircle;

            case 'Warning':
                return FontAwesomeIcon.paths.Warning;

            default:
                return '';
        }
    }

    /**
     * Return the CSS class name to use for the given message
     */
    private static getRowClass(message: ILogMessage) {
        'use strict';

        let rowClass = 'tab-logs-data-default';
        switch (message.level) {
            case 'Verbose':
            case 'Info':
                rowClass = 'tab-logs-data-default';
                break;
            case 'Critical':
            case 'Error':
                rowClass = 'tab-logs-data-error';
                break;
            case 'Warning':
                rowClass = 'tab-logs-data-warning';
                break;
            default:
                rowClass = 'tab-logs-data-default';
                break;
        }
        return rowClass;
    }

    private toggleLevel(level: ILoggingLevelModel) {
        this.props.componentModel.toggleLevel(level);
    }

    private toggleAll() {
        this.props.componentModel.showAll();
    }
}
