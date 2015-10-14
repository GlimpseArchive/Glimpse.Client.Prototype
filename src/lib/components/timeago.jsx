'use strict';

var React = require('react');
var SetIntervalMixin = require('./set-interval-mixin');
var moment = require('moment');

module.exports = React.createClass({
    mixins: [ SetIntervalMixin ],
    render: function () {
        var time = moment(this.props.time);
        return <span title={time.format('MMM Do YYYY, h:mm:ss a')}>{time.fromNow()}</span>;
    },
    componentDidMount: function () {
        var interval = this.props.duration || 60000;

        this.setInterval(this.forceUpdate.bind(this), interval);
    }
});
