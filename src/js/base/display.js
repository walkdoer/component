/**
 * 显示类
 */
define(function (require, exports) {
    'use strict';
    var Class = require('lib/class'),
        Display;

    Display = Class.extend({
        /**
         * 初始化函数
         */
        init: function init(option) {
            if (!option.container) {
                throw new Error('no container in init function');
            }
            this.originOption = $.extend(true, {}, option);
            this.container = option.container;
        },
        /**
         * 显示
         */
        show: function show() {

        },
        /**
         * 隐藏
         */
        hide: function hide() {

        },
        /**
         * 渲染
         */
        render: function render() {

        },
        /**
         * 析构
         */
        destroy: function destroy() {

        },
        /**
         * 添加元素
         */
        append: function append() {

        },
        /**
         * 添加到其他元素中
         */
        appendTo: function appendTo() {

        }
    });
    return Display;
});