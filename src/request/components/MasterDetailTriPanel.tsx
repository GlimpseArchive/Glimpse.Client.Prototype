import * as React from 'react';

interface IMasterDetailTriPanelProps {
    masterPanel;
    leftDetailPanel;
    leftDetailPanelTitle: string;
    rightDetailPanel;
    rightDetailPanelTitle: string;
}

export class MasterDetailTriPanel extends React.Component<IMasterDetailTriPanelProps, {}> {
    public render() {
        return (
            <div className='master-detail-tri-panel'>
                <div className='master-detail-tri-panel-master'>
                {
                    this.props.masterPanel
                }
                </div>
                <div className='master-detail-tri-panel-detail'>
                    <div className='master-detail-tri-panel-detail-panel'>
                        <div className='master-detail-tri-panel-detail-panel-title'>{this.props.leftDetailPanelTitle}</div>
                        <div className='master-detail-tri-panel-detail-panel-content'>{this.props.leftDetailPanel}</div>
                    </div>
                    <div className='master-detail-tri-panel-detail-margin' />
                    <div className='master-detail-tri-panel-detail-panel'>
                        <div className='master-detail-tri-panel-detail-panel-title'>{this.props.rightDetailPanelTitle}</div>
                        <div className='master-detail-tri-panel-detail-panel-content'>{this.props.rightDetailPanel}</div>
                    </div>
                </div>
            </div>
        );
    }
}
