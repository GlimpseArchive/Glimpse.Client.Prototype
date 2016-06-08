import * as React from 'react';

export interface IFilterButtonProps {
    count: number;
    isShown: boolean;
    key?: string;
    name: string;
}

export interface IFilterButtonCallbacks {
    onToggle: () => void;
}

interface IFilterButtonCombinedProps extends IFilterButtonProps, IFilterButtonCallbacks{
}

export class FilterButton extends React.Component<IFilterButtonCombinedProps, {}> {
    public render() {
        return (
            <button className={this.props.isShown ? 'filter-button-shown' : 'filter-button-not-shown'} type='button' onClick={e => this.props.onToggle()}>{this.props.name} ({this.props.count})</button>
        );
    }
}
