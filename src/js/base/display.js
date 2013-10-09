/**
 * 显示类
 */
define(function (require, exports) {
    'use strict';
    var _ = require('core/lang'),
        Class = require('lib/class'),
        tpl = require('core/template'),
        Event = require('base/event'),
        slice = Array.prototype.slice,
        methods = ['show', 'hide', 'toggle', 'appendTo', 'append', 'empty'],
        Display;
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
        getEvent: function (eventName) {
            return Event.get(eventName, this.getType(), this.getName());
        },
        /**
         * 初始化变量
         * @return {[type]} [description]
         */
        _initVariable: function (option, variables) {
            var v;
            for (var i = 0, len = variables.length; i < len; i++) {
                v = variables[i];
                //option的v属性会覆盖对象的v属性
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
            var name = this.getName();
            if (!flagSilent) {
                this.startInit();
            }
            //将option的配置初始化到对象中
            this._initVariable(option, ['tpl', 'parent', 'class', 'id']);
            this.setNum(Date.now().toString());
            if (!option.parent) {
                throw new Error('no parent in init option');
            }
            this.id = option.id ||
                [this.getType(), '-', name ? name + '-' : '',
                  this.getNum()].join('');
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
            this._data = data;
            if (this.tplDowloading) {
                this.waitToRender = true;
            } else if (this.initialized) {
                this.trigger('BEFORE_RENDER', [this, data]);
                if (this.isContinueRender !== false) {
                    this.isContinueRender = true;
                    if (this.hasTplContent()) {
                        this.$el = $(this.tmpl(data));
                        this.$el.attr('id', this.id);
                        this.$el.attr('class', this.class);
                        this.$el.appendTo(this.parent);
                        this.rendered = true; //标志已经渲染完毕
                        this.display = true; //已添加到parent中，默认就是已显示
                        if (this.$el.css('display') === 'none') {
                            this.display = false;
                        }
                    }
                    this.trigger('AFTER_RENDER', [this, data]);
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
         * 监听事件
         * @param  {String}   event    [事件名]
         * @param  {Function} callback [函数]
         */
        on: function () {
            var args = slice.call(arguments, 0);
            args[0] = this.getEvent(args[0]);
            this.parent.on.apply(this.parent, args);
            return this;
        },
        trigger: function () {
            var args = slice.call(arguments, 0);
            args[0] = this.getEvent(args[0]);
            this.parent.trigger.apply(this.parent, args);
            return this;
        },
        /**
         * 析构
         */
        destroy: function () {
            this.$el.remove();
            this.$el = null;
        },
        finishRender: function () {
            this.trigger('RENDERED', [this]);
        }
    });
    //扩展方法
    _.each(methods, function (method) {
        Display.prototype[method] = function () {
            var args = slice.call(arguments);
            this.$el[method].apply(this.$el, args);
        };
    });
    return Display;
});