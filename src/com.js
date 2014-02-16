/**
 * 显示类
 * @extend Component{base/Component}
 */
define([
    './libs/zepto',
    './libs/underscore',
    './base/node',
    './base/event',
    './base/template'
],
function ($, _, Node, Event, template) {
    'use strict';
    var slice = Array.prototype.slice,
        emptyFunc = function () {},
        _handleEvent = function () {
            var type = arguments[0],
                args = slice.call(arguments, 1),
                eventName = this._getEvent(args[0]),
                el;
            el = eventName ? this.$parentEl : this.$el;
            args[0] = eventName || args[0];
            //console.log(type + ': ' + args[0], el[0]);
            el[type].apply(el, args);
            return this;
        },
        DisplayComponent;
    //添加事件
    Event.register('BEFORE_RENDER_FIRST_COMPONENT', 'before:render:firstcomponent');
    DisplayComponent = Node.extend({
        type: 'display',
        /*------- Status --------*/
        tplDowloading: false, //下载模板中
        rendered: false,  //已渲染
        /*-------- Flag ---------*/
        display: true, //是否显示组件
        getState: function () {
            return null;
        },
        init: function (option, callback) {
            var self = this;
            self._super(option);
            self.state = {};
            self.initVar([
                'tpl',
                'tplContent',
                'components',
                'parentNode',
                'parentEl',
                '*state*',
                'getState',
                'className',
                'update',
                'display',
                'el',
                'selector'
            ]);
            self.state.data = option.data;
            self.uiEvents = $.extend(self.uiEvents || {}, option.uiEvents);
            self._cpConstructors = self.components;
            var parentNode = self.parentNode;
            if (self.parentEl) {
                self.$parentEl = $(self.parentEl);
            } else if (parentNode) {
                self.parentEl = parentNode.el;
                self.$parentEl = parentNode.$el;
            } else {
                throw new Error('component [' + this.getId() + '] has no parentNode or parentEl, should have one of those');
            }
            //初始化参数
            self.params = self.getState();
            //初始化组件HTML元素
            self._initHTMLElement(function () {
                self.$el.attr('id', self.id)
                        .attr('class', self.className);
                //监听组件原生listener
                self._listen(self.listeners);
                //用户创建的Listener
                self._listen(option.listeners);
                self._bindUIEvent();
                self.initialized = true;
                if (typeof callback === 'function') {
                    callback();
                }
                //添加新建的子组件到组件中
                self.appendCmp(self._buildComponents());
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
                originOption = self.originOption,
                // fragment = document.createDocumentFragment(),
                firstChild = self.firstChild,
                component = firstChild;
            //先渲染组件的子组件
            while (component) {
                if (!component.selector) {
                    component.parentEl.appendChild(component.render().el);
                } else {
                    component._finishRender();
                }
                component = component.nextNode;
            }
            // if (firstChild) {
            //     firstChild.parentEl.appendChild(fragment);
            // }
            //然后再渲染组件本身，这样子可以尽量减少浏览器的重绘
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
        /**
         * 获取组件的数据
         * @return {Object}
         */
        getData: function () {
            return this.state.data || null;
        },
        _isComNeedUpdate: function (component) {
            return component._isStateChange() && component.rendered;
        },
        /**
         * 更新组件
         * @param  {[type]} state [description]
         * @param  {[type]} data  [description]
         * @return {[type]}       [description]
         */
        update: function (data) {
            var newState = this.getState();
            //更新组件的子组件
            var component = this.firstChild;
            while (component) {
                component.state = newState;
                //组件有状态，且状态改变，则需要更新，否则保持原样
                if (this._isComNeedUpdate(component)) {
                    component.update(data);
                }
                component = component.nextNode;
            }
        },
        /**
         * 添加组件
         * @param  {Array/DisplayComponent} componentArray
         */
        appendCmp: function (componentArray) {
            if (!componentArray) {
                return;
            }
            var self = this;
            componentArray = $.isArray(componentArray) ? componentArray : [componentArray];
            $.each(componentArray, function (i, component) {
                component.on('BEFORE_RENDER', function (event, component) {
                    //组件还没有渲染
                    if (!self._allowToRender(component)) {
                        component.isContinueRender = false;
                    } else {
                        if (!component.prevNode) {
                            self.trigger('BEFORE_RENDER_FIRST_COMPONENT', [self]);
                        }
                        // isContinueRender 表示执行下面的Render
                        component.isContinueRender = true;
                    }
                });
                self.appendChild(component);
            });
        },
        /**
         * 渲染模板
         */
        tmpl: function (tplContent, data) {
            var self = this,
                html;
            tplContent = tplContent || self.tplContent;
            data = data || self.getData();
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
                pushStatusArray = function (key, value) {
                    statusArray.push(value);
                },
                params;
            while (node) {
                statusStr = '';
                params = node.params;
                if (params) {
                    statusArray = [];
                    $.each(params, pushStatusArray);
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
         * 是否允许渲染
         * 只有上一个节点渲染结束之后，当前节点才可渲染,或者单前节点就是第一个节点
         * 这样的规则是为了尽可能的减少浏览器重绘
         * @return {Boolean}
         */
        _allowToRender: function () {
            return !this.prevNode || this.prevNode.rendered;
        },
        /**
         * 初始化模板
         * tpl的取值: #a-tpl-id 或者 'tpl.file.name'
         * @param  {Function} callback 回调
         */
        _initTemplate: function (callback) {
            var self = this,
                tpl = self.tpl,
                html;
            callback = callback || emptyFunc;
            //使用HTML文件中的<script type="template" id="{id}"></script>
            if (tpl && tpl.indexOf('#') === 0) {
                html = $(tpl).html();
                if (html) {
                    self.tplContent = html;
                }
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
            callback(!!self.tplContent);
        },
        /**
         * 初始化HTML元素
         * @param  {Function} callback 回调函数
         */
        _initHTMLElement: function (callback) {
            var self = this,
                selector = self.selector;
            callback = callback || emptyFunc;
            if (self.el) {
                callback();
            } else if (selector) {
                self.$el = self.$parentEl.find(selector);
                self.el = self.$el[0];
                callback();
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
            function onlisten(event, self) {
                return function () {
                    listeners[event].apply(self, arguments);
                };
            }
            if (!listeners) {
                return;
            }
            for (var event in listeners) {
                if (listeners.hasOwnProperty(event)) {
                    this.on(event, onlisten(event, this));
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
        /**
         * 绑定UI事件
         */
        _bindUIEvent: function () {
            var evts = this.uiEvents,
                elementSelector,
                eventType,
                callback,
                onUIEvent = function (callback, context) {
                    return function () {
                        callback.apply(context, arguments);
                    };
                },
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
                this.on(eventType, elementSelector, onUIEvent(callback, this));
            }
        },
        /**
         * 获取事件的实际名称
         * @param  {String} eventName 事件代号 BEFORE_RENDER
         * @return {String}           list:myList:beforerender
         */
        _getEvent: function (eventName) {
            return Event.get(this.type, eventName, this.getType(), this.id);
        },
        /**
         * 组件状态是否有改变
         * @param  {Object}  newParams 组件的新状态
         * @return {Boolean}
         */
        _isStateChange: function () {
            var newParams = this.getState();
            if (!_.equal(newParams, this.params)) {
                this.params = newParams;
                return true;
            } else {
                return false;
            }
        },
        /**
         * 创建子组件
         */
        _buildComponents: function () {
            var self = this,
                cpConstructors = self._cpConstructors,//组件构造函数列表
                components = [],
                Component,
                cItm,
                cp = null;
            //构造子组件（sub Component）
            if ($.isArray(cpConstructors)) {
                for (var i = 0, len = cpConstructors ? cpConstructors.length : 0; i < len; i++) {
                    cItm = cpConstructors[i];
                    if (typeof cItm === 'function') { //构造函数
                        Component = cItm;
                    } else if (typeof cItm === 'object' && cItm._constructor_) { //构造函数以及组件详细配置
                        Component = cItm._constructor_;
                    } else if (cItm instanceof Node) { //已经创建好的组件实例
                        components.push(cItm);
                        continue;
                    } else { //检查到错误，提示使用者
                        throw new Error('Component\'s component config is not right');
                    }
                    //创建组件
                    cp = new Component($.extend({
                        parentNode: self,
                        state: self.state,
                        renderAfterInit: false
                    }, cItm/*cItm为组件的配置*/));
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
        }
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
