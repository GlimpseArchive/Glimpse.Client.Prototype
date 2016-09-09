'use strict';

var util = require('lib/util.js');

module.exports = {
    setup: function (holder) {
        // find the inputs and as selected, make sure we are synced with local storage
        var inputs = holder.find('.glimpse-hud-section-input').change(function() {
            var state = [];
            inputs.each(function() { state.push(this.checked); });
            util.localStorage('glimpseHudDisplay', state);
        });
    },
    current: function () {
        // get out the array stored which represents current state
        return util.localStorage('glimpseHudDisplay') || [];
    }
};