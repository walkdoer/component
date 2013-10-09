/**
 * [组件] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Footer;

    Footer = Component.extend({
        type: 'footer',
        tpl: 'com.footer'
    });
    return Footer;
});