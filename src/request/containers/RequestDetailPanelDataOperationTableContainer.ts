import { selectOperationAction } from '../actions/RequestDetailDataActions';
import { getOperations, getSelectedIndex } from '../selectors/RequestDetailDataSelectors';
import { IRequestState } from '../stores/IRequestState';
import { IRequestDetailPanelDataOperationTableProps, IRequestDetailPanelDataOperationTableCallbacks, RequestDetailPanelDataOperationTable } from '../components/RequestDetailPanelDataOperationTable';

import { connect } from 'react-redux';

import * as _ from 'lodash';

function mapStateToProps(state: IRequestState): IRequestDetailPanelDataOperationTableProps {
    return {
        operations: getOperations(state),
        selectedIndex: getSelectedIndex(state)
    };
}

function mapDispatchToProps(dispatch): IRequestDetailPanelDataOperationTableCallbacks {
    return {
        onSelected: (index: number) => {
            dispatch(selectOperationAction(index));           
        }
    };
}

export const RequestDetailPanelDataOperationTableContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(RequestDetailPanelDataOperationTable);
