'use strict';

import { ILogMessage } from '../messages/ILogMessage';
import { ILoggingComponentModel } from '../component-models/ILoggingComponentModel';

import React = require('react');

export interface ILoggingProps {
    request;
    viewModel: ILoggingComponentModel;
}

/**
 * React class to for the console log messages tab
 */
export class Logging extends React.Component<ILoggingProps, {}> {
    public render() {
        if (!_.isEmpty(this.props.viewModel.messages)) {
            return (
                <div className='tab-content'>
                    <h3>{this.props.viewModel.messages.length} {this.props.viewModel.messages.length === 1 ? 'Message' : 'Messages'}</h3>
                    <table className='table table-bordered table-striped tab-content-item'>
                        <thead>
                            <tr className='table-col-title-group'>
                                <th width='5%'><span className='table-col-title'>#</span></th>
                                <th width='10%'><span className='table-col-title'>Level</span></th>
                                <th><span className='table-col-title'>Message</span></th>
                                <th width='15%'><span className='table-col-title'>From Start</span></th>
                                <th width='10%'><span className='table-col-title'>Duration</span></th>
                            </tr>
                        </thead>
                        {this.props.viewModel.messages.map(function(message, index) {
                            const className = Logging.getRowClass(message);

                            return (
                                <tr className={className}>
                                    <td>{index + 1}</td>
                                    <td>{message.level}</td>
                                    <td>{message.message}</td>
                                    <td>{message.offset ? message.offset + ' ms' : '-'}</td>
                                    <td>-</td>
                                </tr>);
                        }) }
                        <tfoot>
                            <tr className='table-body-padding table-col-title-group'><th colSpan='5'></th></tr>
                        </tfoot>
                    </table>
                </div>
            );
        }
        else {
            return <div className='tab-section text-minor'>Could not find any data.</div>;
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
}
