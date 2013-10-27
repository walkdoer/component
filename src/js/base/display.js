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
        UserError = require('base/userError'),
        Display;

    Display = Class.extend({
        type: 'display',
        tpl: null,
        tplContent: null,
        $parent: null,
        num: null,  //编号
        el: null,
        $el: null,  //该展示区域的容器
        updating: false,  //更新中
        tplDowloading: false, //下载模板中
        rendered: false,  //已渲染
        initializing: false,  //初始化进行中
        initialized: false,  //已初始化
        display: false, //是否已显示
        waitToRender: false, //等待被选人
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
            var self = this,
                tpl = this.tpl;
            if (!tpl) {
                console.warn(['Has no template(tpl) or element(el) config for',
                    '[', this.getType() || '[unknow type]', ']',
                    '[', this.getName() || '[unknow name]', ']',
                    'please check your option'].join(' '));
                return;
            }
            //使用HTML文件中的<script type="template" id="{id}"></script>
            if (tpl.indexOf('#') === 0) {
                this.tplContent = $(tpl).html();
                return;
            }
            this.tplDowloading = true;
            //var startDownloadTime = Date.now();
            require.async('tpl/' + this.tpl, function (res) {
                //var totalTime = Date.now() - startDownloadTime;
                //console.debug('下载模板文件' + self.tpl + '耗时' + totalTime);
                if (res) {
                    self.tplContent = res;
                }
                self.tplDowloading = false;
                if (self.waitToRender) {
                    self.render(self._data);
                    self.waitToRender = false;
                }
            });
        },
        createError: function (code, msg) {
            var err = new Error(msg);
            err.code = code;
            return err;
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
            if (this.parent) {
                this.$parent = $(this.parent);
            }
            if (this.el) {
                this.$el = $(this.el);
            }
            if (typeof this.selector === 'string') {
                this.$el = this.$parent.find(this.selector);
                this.el = this.$el[0];
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
            this._initVariable(option, ['tpl', 'parent', 'className', 'id', 'el', 'selector']);
            this.setNum(Date.now().toString());
            if (option.parent !== false && !option.parent) {
                throw new UserError('noParent', ['parent is not config in the option of', this.getType(), this.getName()].join(' '));
            }
            this.id = option.id ||
                [this.getType(), '-', name ? name + '-' : '',
                  this.getNum()].join('');
            //保存用户原始配置，已备用
            this.originOption = $.extend(true, {}, option);
            //用户指定了元素，则不进行模板渲染, 内置了模板文件，不需要请求模板文件
            if (this.el === null && this.$el === null && !this.tplContent) {
                //没有初始化成功, 需要初始化一个页面的Element
                if (!this._initTpl()) {
                    this.el = document.createElement('section');
                    this.$el = $(this.el).appendTo(this.$parent);
                }
            }
            if (!flagSilent) {
                this.finishInit();
            }
        },
        /**
         * 渲染组件
         */
        render: function (data, callback) {
            //如果有selector则表明该元素已经在页面上了，不需要再渲染
            if (!this.selector) {
                this._data = data;
                if (this.tplDowloading) {
                    this.waitToRender = true;
                } else if (this.initialized) {
                    this.trigger('BEFORE_RENDER', [this, data]);
                    if (this.isContinueRender !== false) {
                        this.isContinueRender = true;
                        //有模板内容才会进行渲染
                        if (this.hasTplContent()) {
                            this.$el = $(this.tmpl(data));
                            this.el = this.$el[0];
                            this.$el.appendTo(this.$parent);
                            this.rendered = true; //标志已经渲染完毕
                            this.display = true; //已添加到$parent中，默认就是已显示
                            if (this.$el.css('display') === 'none') {
                                this.display = false;
                            }
                            this.trigger('AFTER_RENDER', [this, data]);
                        }
                        if (typeof callback === 'function') {
                            callback(this, data);
                        } else {
                            this.finishRender();
                        }
                    }
                }
            }
            //给予id以及Class
            this.$el.attr('id', this.id);
            this.$el.attr('class', this.className);
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
                console.warn(tpl + '模板的内容为空，请检查模板文件是否存在,或者模板加载失败');
            }
            return html || '';
        },
        /**
         * 监听事件,与jQuery 和 Zepto 同理
         */
        on: function () {
            var args = slice.call(arguments, 0),
                el = this.$parent || this.$el;
            args[0] = this.getEvent(args[0]);
            el.on.apply(el, args);
            return this;
        },
        /**
         * 触发事件，同上
         */
        trigger: function () {
            var args = slice.call(arguments, 0);
            args[0] = this.getEvent(args[0]);
            this.$parent.trigger.apply(this.$parent, args);
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