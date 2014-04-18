/**
 * [Component] 底部链接
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/node.display'),
        Event = require('base/event'),
        Bottom;
    Event.add('bottom', {
        'BACK_TO_TOP': 'backToTop',
        'FEED_BACK': 'feedBack',
    });
    Bottom = Component.extend({
        type: 'bottom',
        tpl: '#tpl-bottom',
        uiEvents: {
            'click .b-btn': function () {
                this.trigger('BACK_TO_TOP');
            },
            'click .b-btn2': function () {
                this.trigger('FEED_BACK');
            }
        }
    });
    return Bottom;
});