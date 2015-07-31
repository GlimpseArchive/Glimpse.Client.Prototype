'use strict';

var React = require('react');
var Timeago = require('lib/components/timeago');

module.exports = React.createClass({
    render: function () {
        var summary = this.props.summary;
        // ******* TEMP CODE *******
        var user = summary.user || {};
        var abstract = summary.abstract || {};
        // ******* TEMP CODE *******

        return (
            <table className="table table-bordered">
                <tr>
                    <td width="90">{summary.duration}ms</td>
                    <td colSpan="6">
                        {summary.url} &nbsp; {summary.method} &nbsp; {summary.statusCode} ({summary.statusText}) - {summary.contentType}
                    </td>
                    <td><Timeago time={summary.dateTime} /></td>
                </tr>
                <tr>
                    <td>{user.name}</td>
                    <td>{abstract.networkTime}ms</td>
                    <td>{abstract.serverTime}ms</td>
                    <td>{abstract.clientTime}ms</td>
                    <td>{abstract.controller}.{abstract.action}(...)</td>
                    <td>{abstract.actionTime}ms</td>
                    <td>{abstract.viewTime}ms</td>
                    <td>{abstract.queryTime}ms / {abstract.queryCount}</td>
                </tr>
            </table>
        );
    }
});
