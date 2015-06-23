'use strict';

var _ = require('lodash');

module.exports = { 
    copyProperties: function(source, target) { 
        var didUpdate = false; 
            
        _.forEach(source, function(value, key) { 
            if (value !== target[key]) {
                target[key] = value; 
                didUpdate = true;
            }
        });
                    
        return didUpdate;
    }
};
