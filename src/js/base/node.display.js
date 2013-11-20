/**
 * 显示类
 * @extend Component{base/Component}
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/node'),
        DisplayComponent;
    DisplayComponent = Component.extend({
        type: 'display',
    });
    return DisplayComponent;
});