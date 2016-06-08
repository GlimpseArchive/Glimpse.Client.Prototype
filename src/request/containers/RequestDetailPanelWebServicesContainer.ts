import { getRequestsByOrdinal, getSelectedRequest } from '../selectors/RequestDetailWebServicesSelectors';
import { IWebServicesProps, IWebServicesDispatchProps, WebServices } from '../components/RequestDetailPanelWebServices';
import { selectRequestAction } from '../actions/RequestDetailWebServicesActions';

import { connect } from 'react-redux';

function mapStateToProps(state): IWebServicesProps {
    return {
        requests: getRequestsByOrdinal(state),
        selectedRequest: getSelectedRequest(state)
    };
}

function mapDispatchToProps(dispatch): IWebServicesDispatchProps {
    return {
        onSelectRequest: (requestId: string) => {
            dispatch(selectRequestAction(requestId));
        }
    };
}

export = connect(
    mapStateToProps,
    mapDispatchToProps
)(WebServices);
