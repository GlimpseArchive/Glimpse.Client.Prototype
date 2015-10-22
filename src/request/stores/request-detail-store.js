'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');
var requestRepository = require('../repository/request-repository');
var requestTab = require('../request-tab');

// TODO: Not sure I need to store the requests, already storing in
//       repository
var _requests = {};   // TODO: Remove this, don't need to store
var _viewModel = {
    selectedId: null,
    request: null,
    tabs: null
};

function requestChanged(targetRequests) {
    glimpse.emit('shell.request.detail.changed', targetRequests);
}

function getTabs() {
    // TODO: currently just returning this, but probably should be doing more..
    //       like merging in the static set of tabs with the data we have from
    //       the request.
    return requestTab.registeredTabs();
}

// Clear Request
(function () {
    function clearRequest() {
        var oldId = _viewModel.selectedId;
        
        _viewModel.selectedId = null;
        _viewModel.request = null;
        _viewModel.tabs = null;

        glimpse.emit('data.request.detail.closed', { oldId: oldId });

        requestChanged(_viewModel);
    }

    glimpse.on('shell.request.detail.closed', clearRequest);
})();

// Found Request
(function () {
    function dataFound(payload) {
        var targetRequest = null;

        // TODO: since this has updated records as well not sure if this is right,
        //       does the UI need to know about new vs update
        _.forEach(payload.allRequests, function(request) {
            _requests[request.id] = request;

            if (request.id == _viewModel.selectedId) {
                targetRequest = request;
            }
        });
        

        if (targetRequest) {
            _viewModel.request = targetRequest;
            _viewModel.tabs = getTabs();

            requestChanged(_viewModel);
        }
    }

    // External data coming in
    glimpse.on('data.request.detail.found', dataFound);
})();

// Get Request
(function () {
    function triggerRequest(payload) {
        var requestId = payload.requestId;

        _viewModel.selectedId = requestId;
        _viewModel.request = null;
        _viewModel.tabs = null;

        requestChanged(_viewModel);

        requestRepository.triggerGetDetailsFor(requestId);
    }

    glimpse.on('data.request.detail.requested', triggerRequest);
})();
