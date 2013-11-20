/**
 * [Component] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Event = require('base/event'),
        Logo;
    Event.add('logo', {
        'ADD_URL': 'addurl'
    });
    Logo = Component.extend({
        type: 'logo',
        tpl: '#tpl-top-nav',
        uiEvents: {
            'click .h-btn': function () {
                this.trigger('ADD_URL');
            }
        }
    });
    return Logo;
});