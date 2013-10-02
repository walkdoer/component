/**
 * [组件] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        List;

    List = Component.extend({
        name: 'list',
        tpl: 'com.list'
    });
    return List;
});