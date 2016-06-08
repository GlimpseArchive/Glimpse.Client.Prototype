import { IRequestDetailDataOperationState } from '../stores/IRequestDetailDataOperationState';

const util = require('../../lib/util');

import * as React from 'react';

const classNames = require('classnames');

export interface IRequestDetailPanelDataOperationProps {
    ordinal: number;
    operation: IRequestDetailDataOperationState;
}

export interface IRequestDetailPanelDataOperationTableProps {
    operations: IRequestDetailPanelDataOperationProps[],
    selectedOperationId: string,
}

export interface IRequestDetailPanelDataOperationTableCallbacks {
    onSelected: (operationId: string) => void
}

interface IRequestDetailPanelDataOperationTableCombinedProps
    extends IRequestDetailPanelDataOperationTableProps, IRequestDetailPanelDataOperationTableCallbacks {
}

export class RequestDetailPanelDataOperationTable extends React.Component<IRequestDetailPanelDataOperationTableCombinedProps, {}> {
    public render() {
        return (
            <table className='table table-bordered table-striped table-selectable tab-data-operation-table'>
                <thead>
                    <tr className='table-col-title-group'>
                        <th width='10%'><span className='table-col-title'>Ordinal</span></th>
                        <th width='10%'><span className='table-col-title'>Database</span></th>
                        <th width='48%'><span className='table-col-title tab-data-operation-table-command-column'>Command</span></th>
                        <th width='10%'><span className='table-col-title'>Duration</span></th>
                        <th width='10%'><span className='table-col-title'>Operation</span></th>
                        <th width='10%'><span className='table-col-title'>Records</span></th>
                        <th width='2%' />
                    </tr>
                </thead>
                <tbody>
                    { this.props.operations.map(operation => this.renderOperation(operation)) }
                </tbody>
            </table>
        );
    }
    
    public renderOperation(operation: IRequestDetailPanelDataOperationProps) {
        return (
            <tr className={classNames({ selected: operation.operation.id === this.props.selectedOperationId })} key={operation.operation.id} onClick={e => this.props.onSelected(operation.operation.id)}>
                <td>{operation.ordinal}</td>
                <td>{operation.operation.database}</td>
                <td className='tab-data-operation-table-command-column'>{operation.operation.command}</td>
                <td>{util.timeOrEmpty(operation.operation.duration)}</td>
                <td>{operation.operation.operation}</td>
                <td>{RequestDetailPanelDataOperationTable.getRecordCountText(operation.operation.recordCount)}</td>
                <td />
            </tr>
        );
    }
    
    private static getRecordCountText(recordCount: number) {
        return recordCount
            ? recordCount
            : '-';
    }
}
