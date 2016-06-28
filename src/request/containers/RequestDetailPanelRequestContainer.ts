import { getRequest, getRequestContentType, getResponseContentType } from '../selectors/RequestDetailRequestSelectors';
import { Request } from '../components/RequestDetailPanelRequest';

import { connect } from 'react-redux';

function mapStateToProps(state) {
    const request = getRequest(state);

    return {
        url: request.url,
        request: {
            body: request.request.body,
            contentType: getRequestContentType(state),
            formData: request.request.formData,
            headers: request.request.headers
        },
        response: {
            body: request.response.body,
            contentType: getResponseContentType(state),
            headers: request.response.headers
        }
    }
}

function mapDispatchToProps(dispatch) {
    return {
    };
}

export = connect(
    mapStateToProps,
    mapDispatchToProps
)(Request);
