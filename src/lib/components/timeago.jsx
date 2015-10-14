'use strict';

var _ = require('lodash');
var React = require('react');
var SetIntervalMixin = require('./set-interval-mixin');
var moment = require('moment');

var items = [
    { target: 'a few seconds', replace: '1s' },
    { target: ' minutes', replace: 'm' },
    { target: 'a minute', replace: '1m' },
    { target: ' hours', replace: 'h' },
    { target: 'an hour', replace: '1h' },
    { target: ' days', replace: 'd' },
    { target: 'a day', replace: '1d' },
    { target: ' years', replace: 'y' },
    { target: 'a year', replace: '1y' }
];

var parse = function(value) {
    var result = '';
    _.forEach(items, function(item) {
        if (value.indexOf(item.target) > -1) {
            result = value.replace(item.target, item.replace);
            return false;
        }
    });

    return result;
};

module.exports = React.createClass({
    mixins: [ SetIntervalMixin ],
    render: function () {
        var time = moment(this.props.time);
        var diff = parse(time.fromNow());
        return <span title={time.format('MMM Do YYYY, h:mm:ss a')}>{diff}</span>;
    },
    componentDidMount: function () {
        var interval = this.props.duration || 60000;

        this.setInterval(this.forceUpdate.bind(this), interval);
    }
});
