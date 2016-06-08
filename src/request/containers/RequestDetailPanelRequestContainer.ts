import { getRequest } from '../selectors/RequestDetailRequestSelectors';
import { Request } from '../components/RequestDetailPanelRequest';

import { connect } from 'react-redux';

function mapStateToProps(state) {
    return getRequest(state);
}

function mapDispatchToProps(dispatch) {
    return {
    };
}

export = connect(
    mapStateToProps,
    mapDispatchToProps
)(Request);
