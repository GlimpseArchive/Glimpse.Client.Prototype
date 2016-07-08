'use strict';

import { FontAwesomeIcon } from '../../shell/components/FontAwesomeIcon';
import { ILogMessage } from '../messages/ILogMessage';
import { RequestDetailPanelLoggingFilterBarContainer } from '../containers/RequestDetailPanelLoggingFilterBarContainer';

import _ = require('lodash');
import React = require('react');
import Highlight = require('react-highlight');

class LogMessageObject extends React.Component<{ message: string }, {}> {
    public render() {
        return <div className='tab-logs-table-message-object'><Highlight className='javascript'>{this.props.message}</Highlight></div>;
    }
}

class LogMessageText extends React.Component<{ className: string, ref: string, spans: ILogMessageSpan[] }, {}> {
    public render() {
        return (
            <div className={this.props.className}>{this.props.spans.map((span, index) => <span key={index} className={span.wasReplaced ? 'tab-logs-table-message-replaced-region' : ''}>{span.text}</span>)}</div>
        );
    }
}

interface ILogMessageSpan {
    text: string;
    wasReplaced?: boolean;
}

interface ILogMessageModel extends ILogMessage {
    id: string;
    isObject: boolean;
    ordinal: number;
    spans: ILogMessageSpan[];
}

interface ILogMessageProps {
    message: ILogMessageModel;
}

interface ILogMessageState {
    isExpanded?: boolean;
    isTruncated?: boolean;
}

class LogMessage extends React.Component<ILogMessageProps, ILogMessageState> {
    private static __React = React;
    
    constructor(props?) {
        super(props);

        this.state = {
            isExpanded: false,
            isTruncated: false
        };
    }

    public render() {
        return (
            <div className='tab-logs-table-message' onMouseEnter={e => this.onMouseEnter()} onMouseLeave={e => this.onMouseLeave()}>
                <div className={this.getIconClass()} onClick={e => this.onToggleExpansion()}><FontAwesomeIcon path={this.getExpansionIconPath()} /></div>
                {
                    (this.state.isExpanded && this.props.message.isObject)
                        ? <LogMessageObject message={this.props.message.message} />
                        : <LogMessageText ref='text' className={this.getMessageClass()} spans={this.props.message.spans} />
                }
            </div>);
    }
    
    private onMouseEnter(): void {
        if (!this.props.message.isObject && !this.state.isExpanded && !this.state.isTruncated) {
            const thisWidth = React.findDOMNode(this)['offsetWidth'];
            const messageWidth = React.findDOMNode(this.refs['text'])['offsetWidth'];
            
            this.setState({
                isTruncated: thisWidth < messageWidth
            });
        }
    }
    
    private onMouseLeave(): void {
        if (this.state.isTruncated) {
            this.setState({
                isTruncated: false
            });
        }
    }
    
    private onToggleExpansion(): void {
        this.setState({
            isExpanded: !this.state.isExpanded
        });
    }

    private getIconClass() {
        return (this.props.message.isObject || this.state.isExpanded || this.state.isTruncated)
            ? 'tab-logs-table-message-icon-expandable'
            : 'tab-logs-table-message-icon';
    }

    private getExpansionIconPath() {
        return this.state.isExpanded
            ? FontAwesomeIcon.paths.CaretDown
            : FontAwesomeIcon.paths.CaretRight;
    }

    private getMessageClass() {
        return this.state.isExpanded
            ? 'tab-logs-table-message-multiline'
            : '';
    }
}

export interface ILoggingProps {
    filteredMessages: ({ index: number, message })[];
    totalMessageCount: number;
}

export class Logging extends React.Component<ILoggingProps, {}> {
    constructor(props?) {
        super(props);
    }
    public render() {
        if (this.props.totalMessageCount > 0) {
            return (
                <div className='tab-content tab-logs'>
                    <div className='tab-logs-message-count'>{this.props.totalMessageCount} {this.props.totalMessageCount === 1 ? 'Message' : 'Messages'}</div>
                    <br/>
                    <RequestDetailPanelLoggingFilterBarContainer />
                    <br />
                    <table className='table table-bordered table-striped tab-content-item tab-logs-table'>
                        <thead>
                            <tr className='table-col-title-group'>
                                <th width='10%'><span className='table-col-title'>Ordinal</span></th>
                                <th width='10%'><span className='table-col-title tab-logs-table-icon-column'><FontAwesomeIcon path=''/>Level</span></th>
                                <th width='58%'><span className='table-col-title tab-logs-table-icon-column'><FontAwesomeIcon path=''/>Message</span></th>
                                <th width='10%'><span className='table-col-title'>From Start</span></th>
                                <th width='10%'><span className='table-col-title'>Duration</span></th>
                                <th width='2%' />
                            </tr>
                        </thead>
                        <tbody>
                        {
                            this.props.filteredMessages.map(message => {
                                return (
                                    <tr className='tab-logs-data-default' key={message.index}>
                                        <td>{message.index}</td>
                                        <td className={Logging.getRowClass(message.message.level)}><FontAwesomeIcon path={Logging.getIconPath(message.message.level)} />{message.message.level}</td>
                                        <td className='tab-logs-table-icon-column'><LogMessage message={message.message} /></td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td />
                                    </tr>);
                            })
                        }
                        </tbody>
                        <tfoot>
                            <tr className='table-body-padding table-col-title-group'><th colSpan={6}></th></tr>
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
    private static getRowClass(level: string) {
        let rowClass = 'tab-logs-table-icon-column';

        switch (level) {
            case 'Critical':
            case 'Error':
                rowClass += ' tab-logs-data-error';
                break;
            case 'Warning':
                rowClass += ' tab-logs-data-warning';
                break;
            default:
                rowClass += ' tab-logs-data-default';
                break;
        }

        return rowClass;
    }
}
