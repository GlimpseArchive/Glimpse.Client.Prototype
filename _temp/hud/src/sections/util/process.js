'use strict';

var $ = require('$jquery');

var item = function(layout, defaults) {
    for (var key in layout) {
        layout[key] = $.extend(true, {}, defaults[key], layout[key]);
    }
};

module.exports = {
    init: function(payload) {
        item(payload.layout.mini, payload.defaults);
        item(payload.layout.popup, payload.defaults);
    }
};