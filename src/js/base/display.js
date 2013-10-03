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
        tplDowloading: false, //下载模板中
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
         * 初始化模板
         * 下载模板文件
         */
        initTpl: function () {
            var self = this;
            if (this.tpl) {
                this.tplDowloading = true;
                require.async('tpl/' + this.tpl, function (res) {
                    var delayTime = Math.round(Math.random() * 10000),
                        timer;
                    console.log('下载模板文件[' + self.tpl + ']共耗时', delayTime);
                    timer = setTimeout(function () {
                        //console.debug(self.tpl + '模板加载成功', res);
                        self.tplContent = res;
                        self.tplDowloading = false;
                        if (self.waitToRender) {
                            self.render(self.dataToRender);
                            self.waitToRender = false;
                        }
                        clearTimeout(timer);
                    }, delayTime);
                });
            }
        },
        /**
         * 初始化Display
         * @param  {Object} option      Display所需配置
         * @param  {Boolean} flagSilent 是否改变状态量 true:改变,false:不改变
         */
        init: function init(option, flagSilent) {
            if (!flagSilent) {
                this.startInit();
            }
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
            //初始化模板
            this.initTpl();
            if (!flagSilent) {
                this.finishInit();
            }
        },
        /**
         * 渲染组件
         */
        render: function render(data, callback) {
            if (this.tplDowloading) {
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
                    if (typeof callback === 'function') {
                        callback(this);
                    }
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
            } else {
                console.warn(this.tpl + '模板的内容为空，请检查模板文件是否存在,或者模板加载失败');
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
         * 监听事件
         * @param  {String}   event    [事件名]
         * @param  {Function} callback [函数]
         */
        on: function (event, callback) {
            this.el.on(this.name + ':' + event, callback);
            return this;
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