'use strict';

var $ = require('$jquery');
var chance = require('../../../fake/fake-extension'); 

$.getJSON = function(url, data, callback) {
	// TODO: turn into a strategy latere on if needed
	if (url == '/glimpse/message-history') {
		setTimeout(function() {
			callback(chance.mvcRequest(new Date()).messages);
		}, 1000);
		
	}
}