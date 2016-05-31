import React = require('react');
import Highlight = require('react-highlight');

export interface IRequestDetailPanelDataOperationCommandProps {
    command: string,
    language: string
}

export class RequestDetailPanelDataOperationCommand extends React.Component<IRequestDetailPanelDataOperationCommandProps, {}> {
    public render() {
        return (
            <div className='tab-data-operation-command'>
                <Highlight language={this.props.language}>{this.props.command}</Highlight>
            </div>
        );
    }
}
