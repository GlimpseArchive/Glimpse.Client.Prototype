'use strict';

var _ = require('lodash');
var React = require('react');
var PanelGeneric = require('./request-detail-panel-generic');

module.exports = React.createClass({
    render: function () {    
        var request = this.props.request;
	    var payload = _.values(request.messages).sort(function(a, b) { return (a.ordinal || 0) - (b.ordinal || 0); });
	
        return (
            <div>
                <div><h3>Message Count - {payload.length}</h3></div>
                <table> 
                    <tbody>
                    {payload.map(function(item) { 
                        var payload = item.payload && !_.isEmpty(item.payload) ? <PanelGeneric payload={item.payload} /> : '--';
                        return (
                            <tr key={item.id} className="row-devider">
                                <td>
                                    <h2>{item.types.join(', ')} ({item.ordinal})</h2>
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
        title: 'Messages',
        component: module.exports
    });
})()
