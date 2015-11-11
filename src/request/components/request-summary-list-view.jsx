'use strict';

var glimpse = require('glimpse');
var React = require('react');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var SummaryItem = require('./request-summary-list-item-view');

module.exports = React.createClass({
    render: function () {
        var allRequets = this.props.allRequets;

        return (
            <div className="request-summary-list-holder">
                <ReactCSSTransitionGroup component="div" transitionName="request-summary-group-item">
                    {allRequets.map(function(request) {
                        return <SummaryItem key={request.id} request={request} />;
                    })}
                </ReactCSSTransitionGroup>
                {glimpse.util.isEmpty(allRequets) ?
                    <em>No found entries.</em> :
                    null
                }
            </div>
        );
    }
});
