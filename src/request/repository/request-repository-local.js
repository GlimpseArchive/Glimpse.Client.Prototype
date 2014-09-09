var glimpse = require('glimpse');
var store = require('store.js');

var _storeSummaryKey = 'glimpse.data.summary',
    _storeDetailKey = 'glimpse.data.request';
// store Found Summary
(function() {
    function storeFoundSummary(data) {
      store.set(_storeSummaryKey, data);
    }

    glimpse.on('data.request.summary.found.remote', storeFoundSummary);
    glimpse.on('data.request.summary.found.stream', storeFoundSummary);
})();

// store Found Detail
(function() {
    function storeFoundDetail(data) {
      var key = _storeDetailKey + '.' + data.id;
      store.set(key, data);
    }

    glimpse.on('data.request.detail.found.remote', storeFoundDetail);
})();

module.exports = {
    triggerGetLastestSummaries: function() {
        var data = store.get(_storeSummaryKey);
        if(data && data.length > 0)
          glimpse.emit('data.request.summary.found.local', data);
    },
    triggerGetDetailsFor: function(requestId) {
        var data = store.get(_storeDetailKey + '.' + requestId);
        if(data && data.length > 0)
          glimpse.emit('data.request.detail.found.local', data);
    }
};
