'use strict';

require('./user-store-manage');
require('./user-repository-internal');

var glimpse = require('glimpse');
var localRepository = require('./user-repository-local');

module.exports = {
    triggerGetLastestUsers: function () {
        if (!FAKE_SERVER) {
            localRepository.triggerGetLastestUsers();
        }
    }
};
