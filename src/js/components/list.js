/**
 * [组件] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/node.display'),
        List;

    List = Component.extend({
        type: 'list',
        tpl: 'com.list'
    });
    return List;
});