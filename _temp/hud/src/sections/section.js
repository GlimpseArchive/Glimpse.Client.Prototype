'use strict';

var _sections = [];

var register = function(section) {
    _sections.push(section);
}
var render = function(details, state) {
    var html = '';
    for (var i = 0; i < _sections.length; i++) {
        html += _sections[i].render(details, state[i]);
    }
    return html;
}
var postRender = function(holder, details) {
    for (var i = 0; i < _sections.length; i++) {
        if (_sections[i].postRender) {
            _sections[i].postRender(holder, details);
        }
    }
}

module.exports = {
    register: register,
    render: render,
    postRender: postRender
};

// TODO: Need to come up with a better self registration process
require('./section-http');
require('./section-host');
require('./section-ajax');
