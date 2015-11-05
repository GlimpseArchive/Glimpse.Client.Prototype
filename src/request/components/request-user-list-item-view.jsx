'use strict';

var glimpse = require('glimpse');
var React = require('react');
var Timeago = require('lib/components/timeago');
var classNames = require('classnames');

module.exports = React.createClass({
    render: function () {
        var user = this.props.user;
        var containerClass = classNames({
            'list-item user-status': true, 
            'user-shell-selected': user.selected
        });
        var imgClass = classNames({ 
            'user-status-online': user.online,
        });

        return (
            <div className="request-user-item-holder" onClick={this._onClick}>
                <table className={containerClass}>
                    <tr>
                        <td width="55" rowSpan="2"><img className={imgClass} src={user.details.image} width="40" /></td>
                        <td>{user.details.username}</td>
                    </tr>
                    <tr>
                        <td className="user-status-time"><Timeago time={user.lastActive} /></td>
                    </tr>
                </table>
                <div className="user-status-request-holder">
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
