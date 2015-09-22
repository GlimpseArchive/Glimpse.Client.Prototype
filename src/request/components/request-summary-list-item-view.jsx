'use strict';

var glimpse = require('glimpse');
var messageProcessor = require('../util/request-message-processor.js');

var React = require('react');
var Timeago = require('lib/components/timeago');
var classNames = require('classnames');

module.exports = React.createClass({
    render: function () {
        var summary = this.props.request;
        // ******* TEMP CODE *******
        var user = summary.user || {};
        var abstract = summary.abstract || {};
        // ******* TEMP CODE *******
        
        var containerClass = classNames({
            'request-summary-item-holder': true,
            'request-summary-shell-selected': summary._selected
        });
        

        return (
            <div className={containerClass} onClick={this.onSelect}>
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
            </div>
        );
    },
    onSelect: function () {
        glimpse.emit('shell.request.summary.selected', { requestId: this.props.summary.id });
    }
});
