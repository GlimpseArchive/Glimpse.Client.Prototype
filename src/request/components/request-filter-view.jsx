'use strict';

var glimpse = require('glimpse');
var React = require('react');
var LinkedStateMixin = React.addons.LinkedStateMixin;

module.exports = React.createClass({
    mixins: [ LinkedStateMixin ],
    getInitialState: function () {
        return {
            _requestUrl: '',
            _requestMethod: '',
            _responseContentCategory: '',
            _responseStatusCode: ''
        };
    },
    render: function () {
        return (
            <div>
                <div className="application-section-header">Filters</div>
                <div className="field-section">
                    <label className="field-label" htmlFor="request-fitler-url">Url</label><br />
                    <input type="text" id="request-fitler-url" valueLink={this.linkState('_requestUrl')} />
                </div>
                <div className="field-section">
                    <label className="field-label" htmlFor="request-fitler-method">Method</label><br />
                    <input type="text" id="request-fitler-method" valueLink={this.linkState('_requestMethod')} />
                </div>
                <div className="field-section">
                    <label className="field-label" htmlFor="request-fitler-contentType">Content Type</label><br />
                    <input type="text" id="request-fitler-contentType" valueLink={this.linkState('_responseContentCategory')} />
                </div>
                <div className="field-section">
                    <label className="field-label" htmlFor="request-fitler-statusCode">Status Code</label><br />
                    <input type="text" id="request-fitler-statusCode" valueLink={this.linkState('_responseStatusCode')} />
                </div>
                <div className="button-holder">
                    <div className="button button--default button--primary" onClick={this._onFilter}>Filter</div>
                    <div className="button button--link" onClick={this._onClear}>Clear</div>
                </div>
            </div>
        );
    },
    _onFilter: function () {
        glimpse.emit('shell.request.filter.updated', this.state);
    },
    _onClear: function () {
        var resetState = this.getInitialState();
        this.setState(resetState);

        glimpse.emit('shell.request.filter.updated', resetState);
    }
});
