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
        initVar = ['tpl', 'parent', 'className', 'id', 'el', 'selector'],
        Display;
    Display = Class.extend({
        type: 'display',
        tpl: null,
        tplContent: null,
        parent: null,
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
            if (!this._startInit) {
                this.initialized = false;
                this.initializing = true;
                this._startInit = true;
            }
        },
        finishInit: function () {
            if (!this._finishInit) {
                this.initializing = false;
                this.initialized = true;
                this._finishInit = true;
            }
        },
        /**
         * 是否有模板内容
         * @return {Boolean}
         */
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
        /**
         * 获取单元的名称
         * @return {String}
         */
        getName: function () {
            return this.name || '';
        },
        /**
         * 设置单元名称
         * @param {String} name
         */
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
                return true;
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
                    self.render();
                    self.waitToRender = false;
                }
            });
            return true;
        },
        createError: function (code, msg) {
            var err = new Error(msg);
            err.code = code;
            return err;
        },
        /**
         * {Private} 添加到父亲节点
         */
        _appendElToParent: function () {
            if (this.parent) {
                this.$el.appendTo(this.parent);
            }
        },
        /**
         * 获取事件的实际名称
         * @param  {String} eventName 事件代号 BEFORE_RENDER
         * @return {String}           list:myList:beforerender
         */
        getEvent: function (eventName) {
            return Event.get(eventName, this.getType(), this.getName());
        },
        /**
         * 初始化变量
         * @return {[type]} [description]
         */
        initVariable: function (option, variables) {
            var tmp, optionKey, realKey;
            for (var i = 0, len = variables.length; i < len; i++) {
                tmp = variables[i].split('->');
                optionKey = tmp[0];
                realKey = tmp[1] || optionKey;
                //option的v属性会覆盖对象的v属性
                if (option[optionKey]) {
                    this[realKey] = option[optionKey];
                }
            }
            //创建parent的$(object)对象
            if (this.parent) {
                this.$parent = $(this.parent);
            }
            //创建el的$(object)对象
            if (this.el) {
                this.$el = $(this.el);
            }
            if (typeof this.selector === 'string') {
                this.$el = this.$parent.find(this.selector);
                this.el = this.$el[0];
            }
        },
        /**
         * {Private} 监听事件
         * @param  {Object} listeners 事件配置
         */
        _listen: function (listeners) {
            var self = this;
            listeners = listeners || this.listeners;
            if (!listeners) {
                return;
            }
            for (var event in listeners) {
                if (listeners.hasOwnProperty(event)) {
                    this.on(event, (function (event) {
                        return function () {
                            listeners[event].apply(self, arguments);
                        };
                    })(event));
                }
            }
        },
        /**
         * 初始化Display
         * @param  {Object} option      Display所需配置
         * @param  {Boolean} flagSilent 是否改变状态量 true:改变,false:不改变
         */
        init: function (option) {
            var name = this.getName();
            this.startInit();
            //将option的配置初始化到对象中
            this.initVariable(option, initVar);
            this.setNum(Date.now().toString());
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
                    this.$el = $(this.el);
                } else {
                    //有模板内容才会进行渲染
                    if (this.hasTplContent()) {
                        this.$el = $(this.tmpl());
                    }
                    this.el = this.$el[0];
                }
            }
            this.finishInit();
            //模板没有下载介绍前不进行渲染
            if (!this.tplDowloading) {
                //监听组件原生listener
                this._listen();
                //用户创建的Listener
                this._listen(option.listeners);
                //用户强制不渲染
                if (option.render !== false) {
                    this.render();
                }
            }
        },
        /**
         * 渲染组件
         */
        render: function (callback) {
            //如果有selector则表明该元素已经在页面上了，不需要再渲染
            if (!this.selector || this.rendered) {
                if (this.tplDowloading) {
                    this.waitToRender = true;
                } else if (this.initialized) {
                    this.trigger('BEFORE_RENDER', [this]);
                    if (this.isContinueRender !== false) {
                        this.isContinueRender = true;
                        this._appendElToParent();
                        if (typeof callback === 'function') {
                            callback(this);
                        } else {
                            this.finishRender();
                        }
                    }
                    //给予id以及Class
                    this.$el.attr('id', this.id)
                            .attr('class', this.className);
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
        tmpl: function (data, tplCont) {
            var html;
            tplCont = tplCont || this.tplContent;
            if (tplCont) {
                html = tpl.tmpl(tplCont, data, this.helper);
            } else {
                console.warn(tpl + '模板的内容为空，请检查模板文件是否存在,或者模板加载失败');
            }
            return html || '';
        },
        /**
         * 监听事件,糅合了 jQuery或者Zepto的事件机制，所以使用与上述类库同理
         */
        on: function () {
            var args = slice.call(arguments, 0),
                el = this.$parent || this.$el;
            args[0] = this.getEvent(args[0]);
            //console.debug('on:' + args[0]);
            el.on.apply(el, args);
            return this;
        },
        /**
         * 触发事件，同上
         */
        trigger: function () {
            var args = slice.call(arguments, 0),
                el = this.$parent || this.$el;
            args[0] = this.getEvent(args[0]);
            //console.debug('trigger:' + args[0]);
            el.trigger.apply(el, args);
            return this;
        },
        /**
         * 析构
         */
        destroy: function () {
            this.$el.remove();
            this.$el = null;
        },
        /**
         * 结束渲染
         */
        finishRender: function () {
            this.rendered = true; //标志已经渲染完毕
            this.display = true; //已添加到$parent中，默认就是已显示
            if (this.$el.css('display') === 'none') {
                this.display = false;
            }
            this.trigger('AFTER_RENDER', [this]);
            this.trigger('RENDERED', [this]);
        }
    });
    //扩展方法 'show', 'hide', 'toggle', 'appendTo', 'append', 'empty'
    _.each(methods, function (method) {
        Display.prototype[method] = function () {
            var args = slice.call(arguments);
            this.$el[method].apply(this.$el, args);
        };
    });
    return Display;
});