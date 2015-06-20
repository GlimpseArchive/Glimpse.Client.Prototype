'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');
var requestRepository = require('../repository/request-repository');

// TODO: Not sure I need to store the requests, already storing in
//       repository
var _requests = {};   // TODO: Remove this, don't need to store
var _viewModel = {
    selectedId: null,
    request: null
};

function requestChanged(targetRequests) {
    glimpse.emit('shell.request.detail.changed', targetRequests);
}

// Clear Request
(function () {
    function clearRequest() {
        _viewModel.selectedId = null;
        _viewModel.request = null;

        requestChanged(_viewModel);
    }

    glimpse.on('shell.request.detail.closed', clearRequest);
})();

// Found Request
(function () {
    function dataFound(payload) {
        var targetRequest = null;

        _.forEach(payload.newRequests, function(request) {
            _requests[request.id] = request;

            if (request.id == _viewModel.selectedId) {
                targetRequest = request;
            }
        });
        

        if (targetRequest) {
            _viewModel.request = targetRequest;

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

        requestChanged(_viewModel);

        requestRepository.triggerGetDetailsFor(requestId);
    }

    glimpse.on('data.request.detail.requested', triggerRequest);
})();
