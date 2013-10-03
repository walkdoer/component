/**
 * 组件类
 */
define(function (require, exports) {
    'use strict';
    var Display = require('base/display'),
        Component;

    Component = Display.extend({
        type: 'component',
        /*** Function ***/
        /**
         * 监听事件
         * @param  {String}   event    [事件名]
         * @param  {Function} callback [函数]
         */
        on: function (event, callback) {
            this.el.on(this.name + ':' + event, callback);
            return this;
        }
    });


    return Component;
});