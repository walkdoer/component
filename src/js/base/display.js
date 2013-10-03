/**
 * 显示类
 */
define(function (require, exports) {
    'use strict';
    var Class = require('lib/class'),
        tpl = require('core/template'),
        setVisibility,
        Display;
    /**
     * 设置元素显示还是隐藏
     * @param {Object}  element [Dom元素]
     * @param {Boolean} isShow  [true:显示, false: 隐藏]
     */
    setVisibility = function setVisibility(element, isShow) {
        if (!element) {
            return;
        }
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
        tpl: null,
        tplContent: null,
        parent: null,
        num: null,  //编号
        el: null,  //该展示区域的容器
        updating: false,  //更新中
        rendered: false,  //已渲染
        initializing: false,
        initialized: false,
        display: false,
        waitToRender: false,
        startInit: function startInit() {
            this.initialized = false;
            this.initializing = true;
        },
        finishInit: function finishInit() {
            this.initializing = false;
            this.initialized = true;
        },
        /**
         * 初始化函数
         */
        init: function init(option) {
            var self = this;
            this.startInit();
            this.num = Date.now().toString();
            if (!option.parent) {
                throw new Error('no parent in init option');
            }
            this.originOption = $.extend(true, {}, option);
            this.parent = option.parent;
            this.el = $('<section id="' + this.type + this.num + '"></section>');
            if (option.tpl) {
                this.tpl = option.tpl;
            }
            if (this.tpl) {
                var delayTime = {
                    'com.navigator': 7000,
                    'com.list': 4000,
                    'com.footer': 2000
                };
                require.async('tpl/' + this.tpl, function (res) {
                    var timer;
                    timer = setTimeout(function () {
                        self.tplContent = res;
                        self.finishInit();
                        if (self.waitToRender) {
                            self.render(self.dataToRender);
                            self.waitToRender = false;
                        }
                        clearTimeout(timer);
                    }, delayTime[self.tpl]);
                });
            } else {
                this.finishInit();
            }

        },
        /**
         * 渲染组件
         */
        render: function render(data) {
            if (this.initializing) {
                this.waitToRender = true;
                this.dataToRender = data;
            } else if (this.initialized) {
                this.el.trigger(this.name + ':beforerender', [this, data]);
                if (this.isContinueRender !== false) {
                    this.isContinueRender = true;
                    this.el.append($(this.tmpl(data)));
                    this.el.appendTo(this.parent);
                    this.rendered = true; //标志已经渲染完毕
                    this.display = true; //已添加到parent中，默认就是已显示
                    this.el.trigger(this.name + ':afterrender', [this, data]);
                }
            }
            return this;
        },
        update: function () {
            this.updating = true;
            return this;
        },
        tmpl: function template(data) {
            var tplCont = this.tplContent,
                html;
            if (tplCont) {
                html = tpl.tmpl(tplCont, data, this.helper);
            }
            return html || '';
        },
        /**
         * 显示
         */
        show: function show() {
            setVisibility.call(this, this.el, true);
        },
        /**
         * 隐藏
         */
        hide: function hide() {
            setVisibility.call(this, this.el, false);
        },
        toggle: function toggle() {
            setVisibility.call(this, this.el, !this.isShow);
        },
        /**
         * 析构
         */
        destroy: function destroy() {
            this.el.remove();
            this.el = null;
        },
        /**
         * 添加元素
         */
        append: function append(element) {
            this.el.append(element);
        },
        /**
         * 添加到其他元素中
         */
        appendTo: function appendTo(parent) {
            this.el.appendTo(parent);
        }
    });
    return Display;
});