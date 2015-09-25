'use strict';

var _ = require('lodash');
var React = require('react');
var PanelGeneric = require('./request-detail-panel-generic');

module.exports = React.createClass({
    render: function () {
        return (
            <div>
                <div><h3>Message Count - {_.size(this.props.data.payload)}</h3></div>
                <table> 
                    <tbody>
                    {_.map(this.props.data.payload, function (item) { 
                        var payload = item.payload && !_.isEmpty(item.payload) ? <PanelGeneric payload={item.payload} /> : '--';
                        return (
                            <tr className="row-devider">
                                <td>
                                    <h2>{item.type} ({item.ordinal})</h2>
                                    <h3>Payload</h3>
                                    <div>{payload}</div> 
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
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
