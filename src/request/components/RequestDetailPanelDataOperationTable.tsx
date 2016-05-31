import { IRequestDetailDataOperationState } from '../stores/IRequestDetailDataOperationState';

const util = require('../../lib/util');

import * as React from 'react';

const classNames = require('classnames');

export interface IRequestDetailPanelDataOperationTableProps {
    operations: IRequestDetailDataOperationState[],
    selectedIndex: number,
}

export interface IRequestDetailPanelDataOperationTableCallbacks {
    onSelected: (index: number) => void
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
                {
                    this.props.operations.map((operation, index) => this.renderOperation(operation, index))
                }
                </tbody>
                <tfoot>
                    <tr className='table-body-padding table-col-title-group'>
                        <th colSpan={7} />
                    </tr>
                </tfoot>
            </table>
        );
    }
    
    public renderOperation(operation: IRequestDetailDataOperationState, index: number) {
        return (
            <tr className={classNames({ selected: index === this.props.selectedIndex })} key={index} onClick={e => this.props.onSelected(index)}>
                <td>{index + 1}</td>
                <td>{operation.database}</td>
                <td className='tab-data-operation-table-command-column'>{operation.command}</td>
                <td>{util.timeOrEmpty(operation.duration)}</td>
                <td>{operation.operation}</td>
                <td>{RequestDetailPanelDataOperationTable.getRecordCountText(operation.recordCount)}</td>
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
