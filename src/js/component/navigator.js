/**
 * [组件] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Button = require('component/button'),
        Menu = require('component/menu'),
        Navigator;

    Navigator = Component.extend({
        type: 'navigator',
        tpl: 'com.navigator',
        components: [Button, Menu]
    });
    return Navigator;
});