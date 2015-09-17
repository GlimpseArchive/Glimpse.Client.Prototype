'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');

// TODO: Not sure if the data will ultimately live here or not
var _user = [];
var _userIndex = {};

// republish Found Entry
(function () {
    function republishFoundEntry(userRepositoryMessage) {
        if (userRepositoryMessage.userRequests){
            var newUsers = [];
            _.forEach(userRepositoryMessage.userRequests, function(userRequest) {
                var user = userRequest.user.payload;
                if (!_userIndex[user.userId]) {
                    _userIndex[user.userId] = _user.length;
                    _user.push(user); 
                    
                    newUsers.push(user);
                }
            });
    
            // requests can come in without us knowing anything about users,
            // so only worth doing something if we have anything
            if (userRepositoryMessage.userRequests.length > 0) {
                var payload = {
                    allUsers: _user,
                    newUsers: newUsers,
                    userRequests: userRepositoryMessage.userRequests
                };
        
                glimpse.emit('data.user.detail.found', payload);
            }
        }
    }

    glimpse.on('data.user.detail.found.local', republishFoundEntry);
    glimpse.on('data.user.detail.found.internal', republishFoundEntry);
})();

// TODO: NOT SURE THIS IS THE BEST PLACE FOR THIS
// process Request Update
(function () {
    function mergeUpdateSummary(data) {

        // TODO: Need to complete
        //       Pull from store, publish result

        glimpse.emit('data.user.detail.update', []);
    }

    glimpse.on('data.request.summary.update', mergeUpdateSummary);
})();
