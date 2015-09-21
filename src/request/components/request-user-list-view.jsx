'use strict';

var glimpse = require('glimpse');
var React = require('react');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var UserItem = require('./request-user-list-item-view');

module.exports = React.createClass({
    render: function () {
        var allUsers = this.props.allUsers;

        return (
            <div className="request-user-list-holder">
                <ReactCSSTransitionGroup component="div" transitionName="request-user-item-holder" transitionLeave={false}>
                    {allUsers.map(function(user) {
                        return <UserItem key={user.details.id} user={user} />;
                    })}
                </ReactCSSTransitionGroup>
                {glimpse.util.isEmpty(allUsers) ?
                    <em>No found users.</em> :
                    null
                }
            </div>
        );
    }
});
