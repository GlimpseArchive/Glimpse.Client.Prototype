'use strict';

var glimpse = require('glimpse');
// TODO: Not sure if the data will ultimately live here or not
var userData = [];
var userDataIndex = {};

// republish Found Entry
(function () {
    function republishFoundEntry(requests) {
        // TODO: Need to support if the user is missing
        // TODO: This is very naive atm, no sorting or indexing, etc present
        var newUsers = [];
        var foundAny = false;
        
        for (var i = 0; i < requests.length; i++) {
            var user = requests[i].user;
            if (user) {
                if (!userDataIndex[user.id]) {
                    userDataIndex[user.id] = userData.length;
                    userData.push(user);
                    
                    newUsers.push(user);
                }
    
                foundAny = true;
            }
        }

        // requests can come in without us knowing anything about users,
        // so only worth doing something if we have anything
        if (foundAny) {
            var payload = {
                allUsers: userData,
                newUsers: newUsers,
                newRequests: requests
            };
    
            glimpse.emit('data.user.detail.found', payload);
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
