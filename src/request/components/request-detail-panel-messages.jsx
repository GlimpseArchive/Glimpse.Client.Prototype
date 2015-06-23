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
                    <th>Index</th>
                    <th>Abstract</th>
                    <th>Payload</th>
                </thead>
                {_.map(this.props.data.payload, function (item) { 
                    var index = item.index ? <PanelGeneric payload={item.index} /> : '--';
                    var abstract = item.abstract ? <PanelGeneric payload={item.abstract} /> : '--';
                    var payload = item.payload ? <PanelGeneric payload={item.payload} /> : '--';
                    return (
                        <tr>
                            <td>{item.type}</td>
                            <td>{index}</td>
                            <td>{abstract}</td>
                            <td>{payload}</td>
                        </tr>
                    );
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
