import { selectOperationAction } from '../actions/RequestDetailDataActions';
import { getFilteredOperations, getSelectedOperationId } from '../selectors/RequestDetailDataSelectors';
import { IRequestState } from '../stores/IRequestState';
import { IRequestDetailPanelDataOperationTableProps, IRequestDetailPanelDataOperationTableCallbacks, RequestDetailPanelDataOperationTable } from '../components/RequestDetailPanelDataOperationTable';

import { connect } from 'react-redux';

import * as _ from 'lodash';

function mapStateToProps(state: IRequestState): IRequestDetailPanelDataOperationTableProps {
    return {
        // TODO: How should selection behave as filters are added/removed?
        operations: getFilteredOperations(state),
        selectedOperationId: getSelectedOperationId(state)
    };
}

function mapDispatchToProps(dispatch): IRequestDetailPanelDataOperationTableCallbacks {
    return {
        onSelected: (operationId: string) => {
            dispatch(selectOperationAction(operationId));           
        }
    };
}

export const RequestDetailPanelDataOperationTableContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(RequestDetailPanelDataOperationTable);
