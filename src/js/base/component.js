/**
 * 组件类
 */
define(function (require, exports) {
    'use strict';
    var Display = require('base/display'),
        Component;

    Component = Display.extend({
        type: 'component'
    });


    return Component;
});