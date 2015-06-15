'use strict';

var React = require('react');
var requestTabController = require('../request-tab');
var classNames = require('classnames');

module.exports = React.createClass({
    render: function () {
        var data = this.props.data;
        var name = this.props.name;
        var containerClass = classNames({
            'tab-pane': true,
            'active': this.props.isActive
        });
        
        var tabContent = requestTabController.resolveTab(name);

        return <div className={containerClass}><tabContent.component key={name} name={name} data={data} /></div>;
    }
});
