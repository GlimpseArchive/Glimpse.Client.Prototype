import React = require('react');
import Highlight = require('react-highlight');

export interface IRequestDetailPanelDataOperationCommandProps {
    command: string,
    language: string
}

export class RequestDetailPanelDataOperationCommand extends React.Component<IRequestDetailPanelDataOperationCommandProps, {}> {
    public render() {
        // NOTE: The 0.5.1 version of react-highlight uses 'className' rather than the latest version's 'language'.

        return (
            <div className='tab-data-operation-command'>
                <Highlight className={this.props.language}>{this.props.command}</Highlight>
            </div>
        );
    }
}
