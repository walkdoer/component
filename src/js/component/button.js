/**
 * [组件] 按钮
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Button;

    Button = Component.extend({
        type: 'button',
        tplContent: '<button><%=data.title%></button>'
    });
    return Button;
});