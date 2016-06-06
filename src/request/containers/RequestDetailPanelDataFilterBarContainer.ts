import { getFilters } from '../selectors/RequestDetailDataSelectors';
import { IFilterBarProps, IFilterBarCallbacks, FilterBar } from '../components/FilterBar';
import { IRequestState } from '../stores/IRequestState';
import { toggleFilterAction, showAllAction } from '../actions/RequestDetailDataActions';

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
        onToggle: (name: string) => {
            dispatch(toggleFilterAction(name));           
        }
    };
}

export const RequestDetailPanelDataFilterBarContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(FilterBar);
