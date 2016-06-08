'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');
var messageProcessor = require('./util/request-message-processor');
var requestDetailStore = require('./stores/request-detail-store');

var PanelGeneric = require('./components/request-detail-panel-generic');

var _tabs = {};

module.exports = {
    resolveTab: function (key) {
        // TODO: strategy needs to be improved
        if (_tabs[key]) {
            return _tabs[key];
        }

        // used when there is no tab registerd to handel the result
        return {
            key: 'generic',
            component: PanelGeneric
        };
    },
    registerTab: function (tab) {
        // TODO: validate key being in place
        _tabs[tab.key] = tab;

        glimpse.emit('shell.request.tab.added', { tab: tab });
    },
    registeredTabs: function() {
        return _tabs;
    }
};

// TODO: Need to come up with a better self registration process
require('./components/request-detail-panel-execution');
require('./components/request-detail-panel-messages');

var WebServices = require('./containers/RequestDetailPanelWebServicesContainer');

module.exports.registerTab({
    key: 'tab.webservices',
    title: 'Web Services',
    component: WebServices
});

var RequestContainer = require('./containers/RequestDetailPanelRequestContainer');

module.exports.registerTab({
    key: 'tab.request',
    title: 'Request',
    component: RequestContainer
});

var DataContainer = require('./containers/RequestDetailPanelDataContainer');

module.exports.registerTab({
    key: 'tab.data',
    title: 'Data',
    component: DataContainer
});

var LoggingContainer = require('./containers/RequestDetailPanelLoggingContainer');

module.exports.registerTab({
    key: 'tab.logging',
    title: 'Logs',
    component: LoggingContainer
});