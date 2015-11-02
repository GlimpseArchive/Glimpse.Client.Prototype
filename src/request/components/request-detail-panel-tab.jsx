'use strict';

var React = require('react');
var glimpse = require('glimpse');

function process(data) {
    if (typeof data === 'string') {
        return data;
    }
    else if (glimpse.util.isArray(data)) {
        return processArray(data);
    }
    else if (glimpse.util.isObject(data)) {
        return processObject(data);
    }
    else if (data === null || data === undefined) {
        return '--';
    }
    else if (data === true || data === false) {
        return data ? 'true' : 'false';
    }
    else {
        return data;
    }
}

function processArray(data) {
    if (data.length > 0) {
        var body = data.map(function (item) {
            return <tr><td>{process(item)}</td></tr>;
        });

        return <table><thead><th>Items</th></thead><tbody>{body}</tbody></table>;
    }
}

function processObject(item) {
    var body = [];
    for (var key in item) {
        body.push(<tr key={key}><th>{key}</th><td>{process(item[key])}</td></tr>);
    }

    return <table><thead><th>Key</th><th>Value</th></thead><tbody>{body}</tbody></table>;
}

module.exports = React.createClass({
    render: function () {
        var request = this.props.request;
        var tabMessageId = this.props.tab.key.replace('tab.', '');
        var tabPayload = request.messages[tabMessageId].payload;

        var result = <div>No records found.</div>
        if (tabPayload) {
            result = process(tabPayload);
        }

        return result;
    }
});
