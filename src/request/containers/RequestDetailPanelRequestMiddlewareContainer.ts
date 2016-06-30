import { getMiddleware  } from '../selectors/RequestDetailRequestSelectors';
import { RequestMiddleware } from '../components/RequestDetailPanelRequestMiddleware';

import { connect } from 'react-redux';

function mapStateToProps(state) {
    return {
        middleware: getMiddleware(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
    };
}

export const RequestDetailPanelRequestMiddlewareContainer = connect( /* tslint:disable-line: variable-name */
    mapStateToProps,
    mapDispatchToProps
)(RequestMiddleware);
