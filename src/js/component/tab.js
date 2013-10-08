/**
 * [组件] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Tab;

    Tab = Component.extend({
        type: 'tab',
        tpl: 'com.tab'
    });
    return Tab;
});