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
        startInit: function () {
            this.initialized = false;
            this.initializing = true;
        },
        finishInit: function () {
            this.initializing = false;
            this.initialized = true;
        },
        hasTplContent: function () {
            return !!this.tplContent;
        },
        /**
         * 设置组件Id
         */
        setNum: function (num) {
            this.num = num;
        },
        /**
         * 获取组件Id
         */
        getNum: function () {
            return this.num;
        },
        /**
         * 获取类型 (Component/Page/...)
         */
        getType: function () {
            return this.type;
        },
        getName: function () {
            return this.name || '';
        },
        setName: function (name) {
            this.name = name;
        },
        /**
         * 初始化模板
         * 下载模板文件
         */
        _initTpl: function () {
            var self = this;
            if (!this.tpl && !this.tplContent) {
                throw new Error('no template config for ' + this.getType() + '-' + this.getName() +
                    'please check your option');
            }
            //内置了模板文件，不需要请求模板文件
            if (this.tplContent) {
                return;
            }
            this.tplDowloading = true;
            require.async('tpl/' + this.tpl, function (res) {
                var delayTime = /*{
                    'com.navigator': 2000,
                    'com.footer': 4000,
                    'com.list': 6000
                }*/Math.round(Math.random() * 900),
                    timer;
                console.log('下载模板文件[' + self.tpl + ']共耗时', delayTime);
                timer = setTimeout(function () {
                    //console.debug(self.tpl + '模板加载成功', res);
                    self.tplContent = res;
                    self.tplDowloading = false;
                    if (self.waitToRender) {
                        self.render(self._data);
                        self.waitToRender = false;
                    }
                    clearTimeout(timer);
                }, delayTime);
            });
        },
        /**
         * 初始化变量
         * @return {[type]} [description]
         */
        _initVariable: function (option, variables) {
            var v;
            for (var i = 0, len = variables.length; i < len; i++) {
                v = variables[i];
                //没有变量v或者有v，且不是属于prototype
                if ((!this[v] || this.hasOwnProperty(v)) && option[v]) {
                    this[v] = option[v];
                }
            }
        },
        /**
         * 初始化Display
         * @param  {Object} option      Display所需配置
         * @param  {Boolean} flagSilent 是否改变状态量 true:改变,false:不改变
         */
        init: function (option, flagSilent) {
            if (!flagSilent) {
                this.startInit();
            }
            this._initVariable(option, ['tpl', 'parent']);
            this.setNum(Date.now().toString());
            if (!option.parent) {
                throw new Error('no parent in init option');
            }
            this.originOption = $.extend(true, {}, option);
            //初始化模板
            this._initTpl();
            if (!flagSilent) {
                this.finishInit();
            }
        },
        /**
         * 渲染组件
         */
        render: function (data, callback) {
            var name;
            this._data = data;
            if (this.tplDowloading) {
                this.waitToRender = true;
            } else if (this.initialized) {
                this.trigger('beforerender', [this, data]);
                if (this.isContinueRender !== false) {
                    this.isContinueRender = true;
                    if (this.hasTplContent()) {
                        this.el = $(this.tmpl(data));
                        name = this.getName();
                        this.el.attr('id', [
                            this.getType(), '-',
                            name ? name + '-' : '',
                            this.getNum()
                        ].join(''));
                        this.el.appendTo(this.parent);
                        this.rendered = true; //标志已经渲染完毕
                        this.display = true; //已添加到parent中，默认就是已显示
                    }
                    this.trigger('afterrender', [this, data]);
                    if (typeof callback === 'function') {
                        callback(this, data);
                    } else {
                        this.finishRender();
                    }
                }
            }
            return this;
        },
        update: function () {
            this.updating = true;
            return this;
        },
        /**
         * 渲染模板
         */
        tmpl: function (data) {
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
        show: function () {
            setVisibility.call(this, this.el, true);
        },
        /**
         * 隐藏
         */
        hide: function () {
            setVisibility.call(this, this.el, false);
        },
        toggle: function () {
            setVisibility.call(this, this.el, !this.isShow);
        },
        /**
         * 监听事件
         * @param  {String}   event    [事件名]
         * @param  {Function} callback [函数]
         */
        on: function (event, callback) {
            this.parent.on([this.getType(), ':', this.getName(), ':', event].join(''), callback);
            return this;
        },
        trigger: function (event, callback) {
            this.parent.trigger([this.getType(), ':', this.getName(), ':', event].join(''), callback);
            return this;
        },
        /**
         * 析构
         */
        destroy: function () {
            this.el.remove();
            this.el = null;
        },
        /**
         * 清空组件
         */
        empty: function () {
            this.el.empty();
        },
        /**
         * 添加元素
         */
        append: function (element) {
            this.el.append(element);
        },
        /**
         * 添加到其他元素中
         */
        appendTo: function (parent) {
            this.el.appendTo(parent);
        },
        finishRender: function () {
            this.trigger(this.getType() + 'rendered', [this]);
        }
    });
    return Display;
});