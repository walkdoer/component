/**
 * 组件类
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Page;
    Page = Component.extend({
        type: 'page'
    });

    return Page;
});