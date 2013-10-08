/**
 * [组件] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Button;

    Button = Component.extend({
        type: 'button',
        tpl: 'com.button'
    });
    return Button;
});