import * as React from 'react';

export class TabPanel extends React.Component<{ header: string, children? }, {}> {
    public render() {
        return this.props.children;
    }
}
