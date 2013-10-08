/**
 * [组件] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Menu;

    Menu = Component.extend({
        type: 'menu',
        tpl: 'com.menu'
    });
    return Menu;
});