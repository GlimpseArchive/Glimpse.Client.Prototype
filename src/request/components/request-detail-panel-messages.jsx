'use strict';

var _ = require('lodash');
var React = require('react');
var PanelGeneric = require('./request-detail-panel-generic');

module.exports = React.createClass({
    render: function () {
        return (
            <table>
                <thead>
                    <th>Type</th>
                    <th>Details</th>
                </thead>
                {_.map(this.props.data.payload, function (item) { 
                    var index = item.index ? <PanelGeneric payload={item.index} /> : '--';
                    var abstract = item.abstract ? <PanelGeneric payload={item.abstract} /> : '--';
                    var payload = item.payload ? <PanelGeneric payload={item.payload} /> : '--';
                    var links = item.links ? <PanelGeneric payload={item.links} /> : '--';
                    return (
                        <tr className="row-devider">
                            <th>{item.type} ({item.count})</th>
                            <td>
                                <h3>Index</h3>
                                <div>{index}</div>
                                <h3>Abstract</h3>
                                <div>{abstract}</div>
                                <h3>Payload</h3>
                                <div>{payload}</div>
                                <h3>Links</h3>
                                <div>{links}</div>
                            </td>
                        </tr>
                    );
                    <tr>
                        <td><hr /></td>
                    </tr>
                })}
            </table>
        );
    }
});


// TODO: Need to come up with a better self registration process
(function () {
    var requestTabController = require('../request-tab');

    requestTabController.registerTab({
        key: 'tab.messages',
        component: module.exports
    });
})()
