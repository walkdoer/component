/**
 * [页面] 帮助页面
 */
define(function (require, exports) {
    'use strict';
    var Page = require('base/page'),
        Display = require('base/display'),
        Footer = require('component/footer'),
        Index;
    Index = Page.extend({
        name: 'help',
        components: [{
            _constructor_: Display,
            option: {
                tpl: 'page.help',
                className: 'help'
            }
        }, Footer]
    });
    return Index;
});