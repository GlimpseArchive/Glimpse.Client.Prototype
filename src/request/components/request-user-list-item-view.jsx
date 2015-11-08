'use strict';

var glimpse = require('glimpse');
var React = require('react');
var Timeago = require('lib/components/timeago');
var classNames = require('classnames');

module.exports = React.createClass({
    render: function () {
        var user = this.props.user;
        var containerClass = classNames({
            'request-user-group-item text-primary': true, 
            'request-user-group-item-selected': user.selected
        });
        var imgClass = classNames({ 
            'user-status-online': user.online,
        });

        return (
            <div className={containerClass} onClick={this._onClick}>
                <div className="flex flex-row user-status">
                    <div className="col-1"><img className={imgClass} src={user.details.image} width="40" /></div>
                    <div className="col-2">
                        {user.details.username}
                        <div className="user-status-time text-minor"><Timeago time={user.lastActive} /></div>
                    </div>
                </div>
                <div className="user-status-request-group">
                    {user.latestRequests.map(function (request) {
                        return <div key={request.id}>{request.url}</div>;
                    })}
                </div>
            </div>
        );
    },
    _onClick: function () {
        glimpse.emit('shell.request.user.selected', { userId: this.props.user.details.userId });
    }
});




// TODO: temp code only being used to debug atm
/*



className={containerClass}

    containerClass = 'table table-bordered' + (user.online ? ' user-online' : ' user-offline')



<tr>
    <td colSpan="2">{requests}</td>
</tr>
*/
// TODO: temp code only being used to debug atm
