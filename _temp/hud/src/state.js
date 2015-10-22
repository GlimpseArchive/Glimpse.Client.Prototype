'use strict';

var storage = function (key, value) {
	if (arguments.length == 1)
		return JSON.parse(localStorage.getItem(key));
	localStorage.setItem(key, JSON.stringify(value)); 
};

module.exports = { 
	setup: function (holder) {
		// find the inputs and as selected, make sure we are synced with local storage
		var inputs = holder.find('.glimpse-hud-section-input').change(function() {
			var state = [];
			inputs.each(function() { state.push(this.checked); });
			storage('glimpseHudDisplay', state);
		});
	},
	current: function () {
		// get out the array stored which represents current state
		return storage('glimpseHudDisplay') || [];
	}
};