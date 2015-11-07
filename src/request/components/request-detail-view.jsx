'use strict';

require('../stores/request-detail-store');

var glimpse = require('glimpse');

var React = require('react');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var EmitterMixin = require('lib/components/emitter-mixin');
var Summary = require('./request-detail-summary-view');
var Content = require('./request-detail-content-view');
var Loading = require('lib/components/loading');

module.exports = React.createClass({
    mixins: [ EmitterMixin ],
    componentDidMount: function () {
        this.addListener('shell.request.detail.changed', this._requestDetailChanged);
    },
    render: function () {
        var model = this.state;
        var content = '';
        if (model && model.selectedId) {
            content = (
                <div className="request-detail-holder">
                    <div className="request-holder-content">
                        <div className="button button--link button--close" onClick={this.onClose}>x</div>
                        <div className="application-item-header application-item-header-boxed">Detail</div>
                        {!model.request ?
                            <Loading /> :
                            <div>
                                <Summary request={model.request} />
                                <Content request={model.request} tabs={model.tabs} />
                            </div>
                        }
                    </div>
                </div>
            );
        }
        
        return (
                <ReactCSSTransitionGroup component="div" transitionName="request-detail-holder">
                    {content}
                </ReactCSSTransitionGroup>
            );
    },
    onClose: function () {
        // TODO: Should pass through the id of the request that is being closed
        glimpse.emit('shell.request.detail.closed', {});
    },
    _requestDetailChanged: function (state) {
        this.setState(state);
    }
});
