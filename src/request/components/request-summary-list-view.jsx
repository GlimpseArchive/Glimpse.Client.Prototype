'use strict';

var glimpse = require('glimpse');
var React = require('react');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var SummaryItem = require('./request-summary-list-item-view');

module.exports = React.createClass({
    render: function () {
        var allRequets = this.props.allRequets;

/*
                <ReactCSSTransitionGroup component="div" transitionName="request-summary-group-item" transitionLeave={false}>
                    {allRequets.map(function(request) {
                        return <SummaryItem key={request.id} request={request} />;
                    })}
                </ReactCSSTransitionGroup>
*/

        return (
            <div className="request-summary-list-holder">
                {allRequets.map(function(request) {
                    return <SummaryItem key={request.id} request={request} />;
                })}
                {glimpse.util.isEmpty(allRequets) ?
                    <em>No found entries.</em> :
                    null
                }
            </div>
        );
    }
});
