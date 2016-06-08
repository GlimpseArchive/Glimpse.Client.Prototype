import { TabPanel } from './TabPanel';

import * as React from 'react';

import classNames = require('classnames');

export class TabbedPanel extends React.Component<{ children?: TabPanel[], ref?: string }, { selectedIndex: number }> {
    public constructor(props?) {
        super(props);
        
        this.state = {
            selectedIndex: 0
        };
    }
    
    public render() {
        return (
            <div className='tabbed-panel'>
                { this.renderHeaders() }
                { this.renderSelectedTab() }
            </div>
        );
    }

    public select(index: number) {
        this.onSelect(index);
    }
    
    private renderHeaders() {
        return (
          <div className='tabbed-panel-headers'>
            { this.props.children.map((tabPanel, index) => this.renderHeader(tabPanel.props.header, index)) }
          </div>  
        );
    }
    
    private renderHeader(header: string, index: number) {
        return (
            <div className={classNames('tabbed-panel-header', { 'tabbed-panel-header-selected': index === this.state.selectedIndex })} key={header} onClick={e => this.onSelect(index)}>{header}</div>
        );
    }
    
    private renderSelectedTab() {
        return (
            <div className='tabbed-panel-selected'>
                { this.props.children[this.state.selectedIndex] }
            </div>
        );
    }
    
    private onSelect(index: number) {
        this.setState({
            selectedIndex: index
        });
    }
}
