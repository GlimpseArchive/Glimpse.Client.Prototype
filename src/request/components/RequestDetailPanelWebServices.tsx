import { IRequestDetailWebServicesRequestState } from '../stores/IRequestDetailWebServicesRequestState';
import { MasterDetailTriPanel } from './MasterDetailTriPanel';

import _ = require('lodash');
import React = require('react');
import classNames = require('classnames');

interface IServiceMessagesProps {
    requests: IRequestDetailWebServicesRequestState[];
    selectedRequestId: string;
    onSelectRequest: (requestId: string) => void;
}

/**
 * React class to display console messages
 */
class ServiceMessages extends React.Component<IServiceMessagesProps, {}> {
    public render() {       
        // get child items
        var requestItems = [];
        for (var i = 0; i < this.props.requests.length; i++) {
            const request = this.props.requests[i];
            
            requestItems.push(
                <tr key={request.id} onClick={e => this.props.onSelectRequest(request.id)} className={classNames({
                        'selected': request.id === this.props.selectedRequestId
                    })}> 
                    <td>{request.url}</td>
                    <td>{request.statusCode}</td>
                    <td>{request.method}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                </tr>);
            
        }
        
        return (
            <table className='table table-bordered table-striped table-selectable tab-web-services-table'>
                <thead>
                    <tr className='table-col-title-group'>
                        <th><span className='table-col-title'>Name/Path</span></th>
                        <th width='10%'><span className='table-col-title'>Status</span></th>
                        <th width='10%'><span className='table-col-title'>Method</span></th>
                        <th width='10%'><span className='table-col-title'>Protocol</span></th>
                        <th width='10%'><span className='table-col-title'>Type</span></th>
                        <th width='10%'><span className='table-col-title'>Duration</span></th>
                        <th width='20%'><span className='table-col-title'>Timeline</span></th>
                    </tr>
                </thead>
                <tbody>
                    {requestItems}
                </tbody>
            </table>
        );
    }
}

/**
 * React class to display service details
 */
class ServiceDetailsHeaders extends React.Component<{ headers }, {}> {
    public render() {
        return (
            <div className='tab-web-services-header-details'>
                <table className='table'>
                    <tbody>
                        {_.map(this.props.headers, function(value, key) {
                            return (
                                <tr key={key}>
                                    <td className='truncate'><strong>{key}:</strong> {value}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}

export interface IWebServicesProps {
    requests: IRequestDetailWebServicesRequestState[];
    selectedRequest: IRequestDetailWebServicesRequestState;
}

export interface IWebServicesDispatchProps {
    onSelectRequest: (requestId: string) => void;
}

interface IWebServicesCombinedProps extends IWebServicesProps, IWebServicesDispatchProps{
}

export class WebServices extends React.Component<IWebServicesCombinedProps, {}> {
    public render() {
        return (
            <div className='tab-web-services'>
            {
                this.props.requests.length > 0
                    ? <MasterDetailTriPanel masterPanel={this.renderMaster()} leftDetailPanel={this.renderLeftDetail()} leftDetailPanelTitle='Request' rightDetailPanel={this.renderRightDetail()} rightDetailPanelTitle='Response' />
                    : <div className="tab-section text-minor">Could not find any data.</div>
            }
            </div>
        );
    }

    private renderMaster() {
        const selectedRequestId = this.props.selectedRequest ? this.props.selectedRequest.id : '';
        
        return (
            <div className="tab-web-services-master">
                <h3>{this.props.requests.length} Requests</h3>
                <ServiceMessages onSelectRequest={requestId => this.props.onSelectRequest(requestId)} selectedRequestId={selectedRequestId} requests={this.props.requests} />
            </div>
        );
    }

    private renderLeftDetail() {
        const requestHeaders: { [key:string]: string } = this.props.selectedRequest ? this.props.selectedRequest.requestHeaders : {};
        
        return <ServiceDetailsHeaders headers={requestHeaders} />;
    }

    private renderRightDetail() {
        const responseHeaders: { [key:string]: string } = this.props.selectedRequest ? this.props.selectedRequest.responseHeaders : {};
        
        return <ServiceDetailsHeaders headers={responseHeaders} />;
    }
}
