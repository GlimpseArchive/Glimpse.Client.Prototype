'use strict';

var _ = require('lodash');
var moment = require('moment');
var glimpse = require('glimpse');

var _users = {};
var _usersIndex = [];
var _userSelected = null;

function notifyUsersChanged() {
    var orderedUsers = _usersIndex.sort(function(a, b) {return b.lastActive.valueOf() - a.lastActive.valueOf(); });
    
    glimpse.emit('shell.request.user.detail.changed', {
            allUsers: orderedUsers,
            selectedUserId: _userSelected
        });
}
 
// Clear User
(function () {
    function clearUser() {
        _users[_userSelected].selected = false;
        _userSelected = null;

        notifyUsersChanged();
    }

    glimpse.on('shell.request.user.clear.selected', clearUser);
})();

// Select User
(function() {
    function clear(oldUserId, users) {
        if (oldUserId) {
            var oldUser = users[oldUserId];
            if (oldUser) {
                oldUser.selected = false;
            }
        }
    }

    function select(userId, users) {
        var user = users[userId];
        if (user) {
            user.selected = true;
        }
    }

    function selectUser(payload) {
        var userId = payload.userId;
        var oldUserId = _userSelected;
        var users = _users;

        clear(oldUserId, users);
        select(userId, users);

        _userSelected = userId;

        notifyUsersChanged();
    }

    glimpse.on('shell.request.user.selected', selectUser);
})();

// Found User
(function () {
    // TODO: Timeouts should probably come from config
    // TODO: Should probably be abstracted out into its own module
    var manageRequest = (function () {
        // TODO: Switch offline timeout to settings
        var activityTimeout = 2 * 60 * 1000;
        
        function removeRequest(userViewModel, requestViewModel) {
            var index = userViewModel.latestRequests.indexOf(requestViewModel);
            if (index > -1) {
                userViewModel.latestRequests.splice(index, 1);
            }

            notifyUsersChanged();
        }

        return function (userViewModel, rawRequest) {
            var requestDateTime = moment(rawRequest.dateTime).utc();
            var windowDateTime = moment().utc().subtract(activityTimeout, 'millisecond');
            var diffTime = requestDateTime.diff(windowDateTime);
            
            if (diffTime > 0) {
                var requestViewModel = {
                        id: rawRequest.id,
                        url: rawRequest.url 
                    };

                userViewModel.latestRequests.unshift(requestViewModel);

                // setup callback to clear out request
                setTimeout(function () { removeRequest(userViewModel, requestViewModel); }, diffTime);
            }
        };
    })();
    var manageOnline = (function () {
        // TODO: Switch offline timeout to settings
        var onlineTimeout = 3 * 60 * 1000;
        
        var setOffline = function(userViewModel) {
            userViewModel.online = false;

            notifyUsersChanged();
        };

        return function (userViewModel, rawRequest) {
            var requestDateTime = moment(rawRequest.dateTime).utc();
            var windowDateTime = moment().utc().subtract(onlineTimeout, 'millisecond');
            var diffTime = requestDateTime.diff(windowDateTime);
            
            // only update if newer
            if (!userViewModel.lastActive || requestDateTime.isAfter(userViewModel.lastActive)) {
                userViewModel.lastActive = requestDateTime; 
            }
            
            // detect if online or not 
            if (diffTime > 0) {
                userViewModel.online = true;
    
                if (userViewModel.onlineCallback) {
                    clearTimeout(userViewModel.onlineCallback);
                }
    
                // setup callback to clear out online status
                userViewModel.onlineCallback = setTimeout(function () { setOffline(userViewModel); }, diffTime);
            }
        };
    })();

    function createUser(rawUser) {
        return {
                details: rawUser,
                latestRequests: [],
                lastActive: null,
                online: false,
                selected: false
            };
    }

    function foundUser(userStoreMessage) {
        // TODO: This needs to be cleaned up bit messy atm but will do
        // TODO: Probably need to do some sorting here
        
        _.forEachRight(userStoreMessage.userRequests, function(userRequest) {
            var request = userRequest.request;
            var rawUser = userRequest.user.payload;

            var userViewModel = _users[rawUser.userId];
            if (userViewModel === undefined) {
                userViewModel = createUser(rawUser);
                
                _users[rawUser.userId] = userViewModel;
                _usersIndex.push(userViewModel);
            }

            manageRequest(userViewModel, request);
            manageOnline(userViewModel, request);
        });

        notifyUsersChanged();
    }

    // External data coming in
    glimpse.on('data.user.detail.found', foundUser);
})();
