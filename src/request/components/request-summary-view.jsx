'use strict';

require('../stores/request-summary-store');

var glimpse = require('glimpse');
var React = require('react');
var SummaryList = require('./request-summary-list-view');
var EmitterMixin = require('lib/components/emitter-mixin');

function getState(allRequets) {
    return {
        allRequets: allRequets || []
    };
}

module.exports = React.createClass({
    mixins: [ EmitterMixin ],
    getInitialState: function () {
        return getState();
    },
    componentDidMount: function () {
        this.addListener('shell.request.summary.changed', this._summaryChanged);
    },
    render: function () {
        return (
            <div>
                <div className="application-section-header application-section-header-boxed">Requests</div>
                <SummaryList allRequets={this.state.allRequets} />
            </div>
        );
    },
    _summaryChanged: function (allRequets) {
        this.setState(getState(allRequets));
    }
});
