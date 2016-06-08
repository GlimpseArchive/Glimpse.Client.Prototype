import { getSelectedOperation } from '../selectors/RequestDetailDataSelectors';
import { IRequestState } from '../stores/IRequestState';
import { RequestDetailPanelDataOperationSummary, IRequestDetailPanelDataOperationSummaryProps } from '../components/RequestDetailPanelDataOperationSummary';

import { connect } from 'react-redux';

function mapStateToProps(state: IRequestState, ownProps): IRequestDetailPanelDataOperationSummaryProps {
    return {
        operation: getSelectedOperation(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
    };
}

export const RequestDetailPanelDataOperationSummaryContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(RequestDetailPanelDataOperationSummary);
