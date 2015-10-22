'use strict';

var camelCaseRegEx = /^([A-Z])|[\s-_](\w)/g;

module.exports = {
    localStorage: function (key, value) {
        if (arguments.length == 1) {
            return JSON.parse(localStorage.getItem(key));
        }
        localStorage.setItem(key, JSON.stringify(value)); 
    },
    toCamelCase: function(value) {
        return value.replace(camelCaseRegEx, function(match, p1, p2, offset) {
            if (p2) {
                return p2.toUpperCase();
            }
            return p1.toLowerCase();        
        });
    }
};