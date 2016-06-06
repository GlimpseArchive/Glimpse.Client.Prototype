import { getSelectedOperation } from '../selectors/RequestDetailDataSelectors';
import { IRequestState } from '../stores/IRequestState';
import { RequestDetailPanelDataOperationCommand, IRequestDetailPanelDataOperationCommandProps } from '../components/RequestDetailPanelDataOperationCommand';

import { connect } from 'react-redux';

function getLanguageForDatabase(database: string): string {
    switch (database) {
        case 'MongoDB':
            return 'json';
        default: 
            return 'sql';
    }
}

function mapStateToProps(state: IRequestState, ownProps): IRequestDetailPanelDataOperationCommandProps {
    const operation = getSelectedOperation(state);

    return {
        command: operation ? operation.operation.command : '',
        language: getLanguageForDatabase(operation ? operation.operation.database : undefined)
    }    
}

function mapDispatchToProps(dispatch) {
    return {
    };
}

export const RequestDetailPanelDataOperationCommandContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(RequestDetailPanelDataOperationCommand);
