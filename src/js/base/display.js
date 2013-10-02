/**
 * 显示类
 */
define(function (require, exports) {
    'use strict';
    var Class = require('lib/class'),
        setVisibility,
        Display;
    /**
     * 设置元素显示还是隐藏
     * @param {Object}  element [Dom元素]
     * @param {Boolean} isShow  [true:显示, false: 隐藏]
     */
    setVisibility = function setVisibility(element, isShow) {
        var func = isShow ? 'show' : 'none',
            style = isShow ? 'block' : 'none';
        if (element[func] === 'function') {
            element.show();
        } else {
            element.style.display = style;
        }
    };
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
            setVisibility(this.container, true);
        },
        /**
         * 隐藏
         */
        hide: function hide() {
            setVisibility(this.container, false);
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