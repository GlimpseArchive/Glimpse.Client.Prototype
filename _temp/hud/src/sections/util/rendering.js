'use strict';

var $ = require('$jquery');

var sizes = [ 'extra-large', 'large', 'normal', 'small', 'extra-small' ];
var position = [ 'top', 'bottom', 'left', 'right' ];
var align = [ 'left', 'right' ];

var shouldUse = function(isVisible, details) {
    if (isVisible !== undefined && isVisible) {
        var isFunction = $.isFunction(isVisible);
        return (isFunction && isVisible(details)) || (!isFunction && isVisible);
    }
    return true;
};
var popup = function(structure, details) {
    return '<div class="glimpse-hud-popup" style="border-color:' + structure.color + ';"><label class="glimpse-hud-title" for="glimpse-hud-section-input-' + structure.id + '"><span>' + structure.title + '</span></label><div class="glimpse-hud-popup-inner">' + structure.popup.render(details) + '</div></div><div class="glimpse-hud-popup-expander"></div>';
};
var section = function(structure, details, opened) {
    var html = '<div class="glimpse-hud-section glimpse-hud-section-' + structure.id + '" style="border-color:' + structure.color + '">';

    html += '<label class="glimpse-hud-title" for="glimpse-hud-section-input-' + structure.id + '"><span>' + structure.title + '</span></label><input type="checkbox" class="glimpse-hud-section-input" id="glimpse-hud-section-input-' + structure.id + '"' + (opened ? ' checked="checked"' : '') + ' />';
    html += '<div class="glimpse-hud-section-inner">';
    for (var key in structure.layout.mini) {
        html += item(structure.layout.mini[key], details);
    }
    html += '</div>';

    if (!structure.popup.suppress) { html += popup(structure, details); }

    return html + '</div>';
};
var item = function(item, details) {
    var html = '';
    if (shouldUse(item.visible, details)) {
        var title = '<div class="glimpse-hud-header">' + item.title + '</div>',
            postfix = item.postfix ? '<span class="glimpse-hud-postfix">' + item.postfix + '</span>' : '',
            value = item.getLayoutData ? item.getLayoutData(details) : '<span class="glimpse-hud-data">' + item.getData(details) + '</span>' + postfix,
            id = item.id ? ' ' + item.id : '';

        html += item.getLayout ? item.getLayout(details) : '<div class="glimpse-hud-detail glimpse-hud-detail-' + sizes[item.size] + ' glimpse-hud-detail-position-' + position[item.position] + ' glimpse-hud-detail-align-' + align[item.align] + id + '" title="' + item.description + '">' + (item.position % 2 == 0 ? title : '') + '<div class="glimpse-hud-value">' + value + '</div>' + (item.position % 2 == 1 ? title : '') + '</div>';
    }

    return html;
};

module.exports = {
    section: section,
    item: item,
    popup: popup
};