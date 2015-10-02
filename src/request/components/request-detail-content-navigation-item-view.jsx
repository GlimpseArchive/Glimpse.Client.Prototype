'use strict';

var glimpse = require('glimpse');
var React = require('react');
var classNames = require('classnames');

module.exports = React.createClass({
    render: function () {
        var tab = this.props.tab;
        var containerClass = classNames({
            'active': this.props.isActive
        });

        return <li className={containerClass} onClick={this._onClick}><a href="#">{tab.title}</a></li>;
    },
    _onClick: function (payload) {
        glimpse.emit('shell.request.detail.focus.changed', { tab: this.props.tab.key });
    }
});
