/**
 * 显示类
 * @extend Component{base/Component}
 */
define(function (require, exports) {
    'use strict';
    var $ = require('selector'),
        _ = require('core/lang'),
        slice = Array.prototype.slice,
        Component = require('base/node'),
        template = require('core/template'),
        emptyFunc = function () {},
        _handleEvent = function () {
            var type = arguments[0],
                args = slice.call(arguments, 1),
                eventName = this.getEvent(args[0]),
                el;
            el = eventName ? this.$parentEl : this.$el;
            args[0] = eventName || args[0];
            //console.log(type + ': ' + args[0], el[0]);
            el[type].apply(el, args);
            return this;
        },
        DisplayComponent;
    /**
     * 比较两个组件是不是同一个
     * @param  {Component}  cpA
     * @param  {Component}  cpB
     * @return {Boolean}
     */
    function isSameComponent(cpA, cpB) {
        //console.debug(cpA.type, cpB.type);
        return cpA.type === cpB.type && cpA.num === cpB.num;
    }
    DisplayComponent = Component.extend({
        type: 'display',
        /*------- Status --------*/
        tplDowloading: false, //下载模板中
        rendered: false,  //已渲染
        /*-------- Flag ---------*/
        display: true, //是否显示组件
        init: function (option, callback) {
            var self = this;
            self._super(option);
            self.initVar([
                'tpl',
                'tplContent',
                'parentEl',
                'className',
                'display',
                'el',
                'selector'
            ]);
            //初始化组件HTML元素
            self._initElement(function () {
                self.$el.attr('id', self.id)
                        .attr('class', self.className);
                //监听组件原生listener
                self._listen(self.listeners);
                //用户创建的Listener
                self._listen(option.listeners);
                if (typeof callback === 'function') {
                    callback();
                } else { //如果没有callback，则直接结束初始化
                    self.finishInit();
                }
                //之前被通知过render，模板准备好之后进行渲染
                if (self.needToRender) {
                    self.render();
                }
            });
        },
        /**
         * 渲染组件
         */
        render: function () {
            var self = this,
                originOption = self.originOption;
            //如果有selector则表明该元素已经在页面上了，不需要再渲染
            if (!self.selector || self.rendered) {
                if (self.initialized) {
                    self.trigger('BEFORE_RENDER', [self]);
                    if (self.isContinueRender !== false) {
                        self.isContinueRender = true;
                        self.$el.css({
                            width: originOption.width,
                            height: originOption.height
                        });
                        if (self.display === false) {
                            self.$el.css('display', 'none');
                        }
                        self._finishRender();
                    }
                } else {
                    //异步情况下，用户通知渲染时尚未初始化结束
                    self.needToRender = true;
                }
            }
            return self;
        },
        update: function () {
            return this;
        },
        /**
         * 渲染模板
         */
        tmpl: function (tplContent, data) {
            var self = this,
                html;
            tplContent = tplContent || self.tplContent;
            data = data || self.data;
            if (tplContent) {
                html = template.tmpl(tplContent, data, self.helper);
            } else {
                console.warn(['Has no template content for',
                    '[', self.getType() || '[unknow type]', ']',
                    '[', self.id || '[unknow name]', ']',
                    'please check your option', '模板的内容为空，请检查模板文件是否存在,或者模板加载失败'].join(' '));
            }
            return html || '';
        },
        /**
         * 添加到父亲节点
         */
        appendToParent: function () {
            if (this.parentEl) {
                this.$el.appendTo(this.parentEl);
            }
            return this;
        },
        /**
         * 是否有模板内容
         * @return {Boolean}
         */
        hasTplContent: function () {
            return !!this.tplContent;
        },
        /**
         * 监听事件,糅合了 jQuery或者Zepto的事件机制，所以使用与上述类库同理
         */
        on: function () {
            return _handleEvent.apply(this, ['on'].concat(slice.call(arguments, 0)));
        },
        /**
         * 触发事件，同上
         */
        trigger: function () {
            return _handleEvent.apply(this, ['trigger'].concat(slice.call(arguments, 0)));
        },
        /**
         * 获取组件在层级关系中的位置
         * @return {String} /index/recommend/app12
         */
        getAbsPath: function () {
            var pathArray = [],
                node = this,
                statusArray,
                statusStr,
                params;
            while (node) {
                statusStr = '';
                params = node.params;
                if (params) {
                    statusArray = [];
                    $.each(params, function (key, value) {
                        statusArray.push(value);
                    });
                    //产生出 '(status1[,status2[,status3]...])' 的字符串
                    statusStr = ['(', statusArray.join(','), ')'].join('');
                }
                pathArray.push(node.id + statusStr);
                node = node.parentNode;
            }
            pathArray.push('');
            return pathArray.reverse().join('/');
        },
        /**
         * 初始化模板
         * @param  {Function} callback 回调
         */
        _initTemplate: function (callback) {
            var self = this,
                tpl = self.tpl;
            callback = callback || emptyFunc;
            //使用HTML文件中的<script type="template" id="{id}"></script>
            if (tpl && tpl.indexOf('#') === 0) {
                self.tplContent = $(tpl).html();
                callback(true);
            } else if (tpl) {
                //tpl配置是文件，异步加载文件
                require.async('tpl/' + tpl, function (res) {
                    if (res) {
                        self.tplContent = res;
                        callback(true);
                    } else {
                        callback(false);
                    }
                });
            }
        },
        /**
         * 初始化HTML元素
         * @param  {Function} callback 回调函数
         */
        _initElement: function (callback) {
            var self = this,
                selector = self.selector;
            callback = callback || emptyFunc;
            if (self.el) {
                callback();
            } else if (selector) {
                self.$el = self.$parentEl.find(selector);
                self.el = self.$el[0];
            } else {
                self._initTemplate(function (success) {
                    if (success) {
                        self.$el = $(self.tmpl());
                        self.el = self.$el[0];
                    } else {
                        //没有初始化成功, 需要初始化一个页面的Element
                        self.el = document.createElement('section');
                        self.$el = $(self.el);
                    }
                    callback();
                });
            }
        },
        /**
         * 监听事件
         * @param  {Object} listeners 事件配置
         */
        _listen: function (listeners) {
            if (!listeners) {
                return;
            }
            for (var event in listeners) {
                if (listeners.hasOwnProperty(event)) {
                    this.on(event, (function (event, self) {
                        return function () {
                            listeners[event].apply(self, arguments);
                        };
                    })(event, this));
                }
            }
        },
        /**
         * 结束渲染
         */
        _finishRender: function () {
            this.rendered = true; //标志已经渲染完毕
            this.trigger('AFTER_RENDER', [this]);
        },
        _popWaitQueue: function () {
            return this._componentsWaitToRender.splice(0, 1)[0];
        },
        /**
         * 检查Component是不是已经在等待渲染队列中
         * @param  {Component}  component 组件
         * @return {Boolean}
         */
        isInWaitQueue: function (component) {
            var components = this._componentsWaitToRender;
            for (var i = 0; i < components.length; i++) {
                if (isSameComponent(components[i], component)) {
                    return true;
                }
            }
            return false;
        },
        /**
         * 是否所有的组件都已渲染完毕
         * @return {Boolean}
         */
        isAllComponentRendered: function () {
            if (this._componentsWaitToRender.length === 0) {
                return true;
            }
            return false;
        },
        _bindUIEvent: function () {
            var evts = this.uiEvents,
                elementSelector,
                eventType,
                callback,
                evtConf;
            if (!evts) {
                return;
            }
            for (var evt in evts) {
                evtConf = evt.split(' ');
                if (evtConf.length > 1) {
                    elementSelector = evtConf.slice(1).join(' ');
                } else {
                    //如果没有配置托管的对象，则使用对象本身Id
                    //例如 {
                    //    'click': function() {}
                    //}
                    //等价于{
                    //    'click #elementId', function() {}
                    //}
                    elementSelector = '#' + this.id;
                }
                eventType = evtConf[0];
                callback = evts[evt];
                this.on(eventType, elementSelector, (function (callback, context) {
                    return function () {
                        callback.apply(context, arguments);
                    };
                })(callback, this));
            }
        },
        getParams: function (newState) {
            var self = this,
                newParams,
                state = self.state;
            if ($.isArray(state)) {
                newParams = {};
                $.each(state, function (index, stateItm) {
                    var hierarchy = stateItm.split('.'),
                        state = newState,
                        paramKey;
                    $.each(hierarchy, function (index, key) {
                        state = state[key];
                        paramKey = key;
                    });
                    newParams[paramKey] = state;
                });
            }
            return newParams;
        },
        isStateChange: function (newParams) {
            var state = this.getParams(newParams);
            if (!_.equal(state, this.params)) {
                this.params = state;
                return true;
            } else {
                return false;
            }
        },
        _buildComponents: function () {
            var self = this,
                cpConstructors = self._cpConstructors,//组件构造函数列表
                components = [],
                Component,
                option = this.originOption,
                cItm,
                prevCp = null,
                cp = null;
            //构造子组件（sub Component）
            if ($.isArray(cpConstructors)) {
                for (var i = 0, len = cpConstructors ? cpConstructors.length : 0; i < len; i++) {
                    cItm = cpConstructors[i];
                    if (typeof cItm === 'function') { //构造函数
                        Component = cItm;
                    } else if (typeof cItm === 'object' && cItm._constructor_) { //构造函数以及组件详细配置
                        Component = cItm._constructor_;
                    } else if (cItm instanceof Display) { //已经创建好的组件实例
                        components.push(cItm);
                        continue;
                    } else { //检查到错误，提示使用者
                        throw new Error('Component\'s component config is not right');
                    }
                    //创建组件
                    cp = new Component($.extend({
                        parentEl: self.el,
                        parentNode: self,
                        params: option.params,
                        queries: option.queries,
                        data: self.data,
                        renderAfterInit: false
                    }, cItm.option/*cItm.option为组件的配置*/));
                    self._linkCmp(cp, prevCp);
                    prevCp = cp;
                    components.push(cp);
                }
                return components;
            } else {
                //对于配置: components 'component/componentName'
                //表示所有的组件都是由该类型组件构成
                //todo 由于这里的应用场景有限，所以为了代码大小考虑，
                //为了保证功能尽可能简单，暂时不做这部分开发（考虑传入的是构造函数和组件文件地址的情况）
                return null;
            }
            return null;
        },
    });
    //扩展方法 'show', 'hide', 'toggle', 'appendTo', 'append', 'empty'
    _.each(['show', 'hide', 'toggle', 'empty'], function (method) {
        DisplayComponent.prototype[method] = function () {
            var args = slice.call(arguments);
            this.$el[method].apply(this.$el, args);
            return this;
        };
    });
    return DisplayComponent;
});