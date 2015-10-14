'use strict';

var glimpse = require('glimpse');
var metadataRepository = require('./repository/metadata-repository');

var React = require('react');
var Shell = require('./components/shell-view');
var _applications = [];

module.exports = {
    registerApplication: function (application) {
        _applications.push(application);

        glimpse.emit('shell.application.added', { application: application });
    },
    initialize: function () {
        metadataRepository.triggerGetMetadata();
        
        React.render(
            React.createElement(Shell, { applications: _applications }),
            document.getElementById('application-holder'));

        glimpse.emit('shell.ready', {});
    }
};

// TODO: Need to come up with a better self registration process
require('request/components/request-view');
