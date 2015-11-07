'use strict';

require('../stores/request-user-store');

var glimpse = require('glimpse');
var React = require('react');
var UserList = require('./request-user-list-view');
var EmitterMixin = require('lib/components/emitter-mixin');

function getState(payload) {
    return {
        allUsers: (payload && payload.allUsers) ? payload.allUsers : [],
        selectedUserId: (payload && payload.selectedUserId) ? payload.selectedUserId : null
    };
}

module.exports = React.createClass({
    mixins: [ EmitterMixin ],
    getInitialState: function () {
        return getState();
    },
    componentDidMount: function () {
        this.addListener('shell.request.user.detail.changed', this._userChanged);
    },
    render: function () {
        var button = null;
        if (this.state.selectedUserId) {
            button = <div className="button-holder"><div className="button button--link" onClick={this._onClearSelection}>Clear</div></div>;
        }
    
        return (
            <div>
                <div className="application-item-header">User Sessions</div>
                <UserList allUsers={this.state.allUsers} />
                {button}
            </div>
        );
    },
    _userChanged: function (allUsers) {
        this.setState(getState(allUsers));
    },
    _onClearSelection: function () {
        glimpse.emit('shell.request.user.clear.selected', {});
    }
});
