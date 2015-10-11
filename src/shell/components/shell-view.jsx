'use strict';

require('./shell-view.scss');

var React = require('react');
var glimpse = require('glimpse');
var EmitterMixin = require('lib/components/emitter-mixin');

module.exports = React.createClass({
    mixins: [ EmitterMixin ],
    componentDidMount: function () {
        this.addListener('shell.application.added', this._applicationAdded);
    },
    render: function () {
        return (
            <div className="glimpse-main">
                <header className="glimpse-header">
                    <span className="glimpse-logo"><img src="./logo-long-white.png" /></span>
                </header>
                <div className="application-holder page-content-holder">
                    {this.props.applications.map(function (application) {
                        return <application.component key={application.key} />;
                    })}
                </div>
            </div>
        );
    },
    _applicationAdded: function () {
        this.forceUpdate();
    }
});
