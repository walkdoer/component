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
        var func = isShow ? 'show' : 'hide',
            style = isShow ? 'block' : 'none';
        if (typeof element[func] === 'function') {
            element[func]();
        } else {
            element.style.display = style;
        }
        this.display = isShow;
    };
    Display = Class.extend({
        initializing: false,
        initialized: false,
        display: false,
        /**
         * 初始化函数
         */
        init: function init(option) {
            this.initializing = true;
            if (!option.container) {
                throw new Error('no container in init function');
            }
            this.originOption = $.extend(true, {}, option);
            this.container = option.container;
            this.initializing = false;
            this.initialized = true;
        },
        /**
         * 显示
         */
        show: function show() {
            setVisibility.call(this, this.container, true);
        },
        /**
         * 隐藏
         */
        hide: function hide() {
            setVisibility.call(this, this.container, false);
        },
        toggle: function toggle() {
            setVisibility.call(this, this.container, !this.isShow);
        },
        /**
         * 析构
         */
        destroy: function destroy() {
            this.container.remove();
            this.container = null;
        },
        /**
         * 添加元素
         */
        append: function append(element) {
            this.container.append(element);
        },
        /**
         * 添加到其他元素中
         */
        appendTo: function appendTo(parent) {
            this.container.appendTo(parent);
        }
    });
    return Display;
});