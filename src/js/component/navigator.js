/**
 * [组件] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Navigator;

    Navigator = Component.extend({
        type: 'navigator',
        tpl: 'com.navigator'
    });
    return Navigator;
});