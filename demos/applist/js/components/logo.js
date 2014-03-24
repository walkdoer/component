/**
 * [Component] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('lib/com'),
        Logo;
    Logo = Component.extend({
        type: 'logo',
        tpl: '#tpl-top-nav',
        uiEvents: {
            'click .h-btn': function () {
                this.trigger('addurl');
            }
        }
    });
    return Logo;
});
