import { getFilters } from '../selectors/RequestDetailLoggingSelectors';
import { IFilterBarProps, IFilterBarCallbacks, FilterBar } from '../components/FilterBar';
import { IRequestState } from '../stores/IRequestState';
import { toggleLevelAction, showAllAction } from '../actions/RequestDetailLoggingActions';

import { connect } from 'react-redux';

function mapStateToProps(state: IRequestState): IFilterBarProps {
    return {
        filters: getFilters(state),
    };
}

function mapDispatchToProps(dispatch): IFilterBarCallbacks {
    return {
        onShowAll: () => {
            dispatch(showAllAction());
        },
        onToggle: (name: string, index: number) => {
            dispatch(toggleLevelAction(index));           
        }
    };
}

export const RequestDetailPanelLoggingFilterBarContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(FilterBar);
