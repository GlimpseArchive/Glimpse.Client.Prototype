'use strict';

var $ = require('$jquery');

var getData = function(callback) {
	// TODO: need to use message history template here instead of it being hard coded
	$.getJSON('/glimpse/message-history', callback);
}

module.exports = {
	getData: getData
};