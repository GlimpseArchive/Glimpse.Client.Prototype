'use strict';

// DEV TIME CODE
if (FAKE_SERVER) {
    require('fake');
}
// DEV TIME CODE

require('./index.scss');

var $ = require('$jquery');
var util = require('lib/util');
var state = require('./state');
var repository = require('./repository');
var sections = require('./sections/section');

//var details = args.newData.hud;
var setup = state.current();

// get into dom asap to trigger asset loading
$(function() {
	var html = '<div class="glimpse"><div class="glimpse-icon"><div class="glimpse-icon-text">Glimpse</div></div><div class="glimpse-hud"></div></div>'
	$(html).appendTo('body');
});

// only load things when we have the data ready to go
repository.getData(function(details) { 
	$(function() { setTimeout(function() { 
		// generate the html needed for the sections
		var html = sections.render(details, setup);
		
		// insert the html into the dom
		var holder = $(html).appendTo('.glimpse-hud');
		
		// force the correct state from previous load
		state.setup(holder);
		
		// setup events that we need to listen to
		sections.postRender(holder);
		
		// TODO: need to find a better place for this
		$('.glimpse-icon').click(function() {
			window.open(util.resolveClientUrl(util.currentRequestId(), true), 'GlimpseClient');
		});
	}, 0); });
});