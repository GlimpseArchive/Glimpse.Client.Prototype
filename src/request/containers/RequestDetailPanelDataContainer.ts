import { DataComponent, IDataComponentProps } from '../components/RequestDetailPanelData';
import { IRequestState } from '../stores/IRequestState';
import { getTotalOperationCount } from '../selectors/RequestDetailDataSelectors';

import { connect } from 'react-redux';

function mapStateToProps(state: IRequestState): IDataComponentProps {
    return {
        totalOperationCount: getTotalOperationCount(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
    };
}

export = connect(
    mapStateToProps,
    mapDispatchToProps
)(DataComponent);
