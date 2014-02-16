/*!
 * Com v0.1.1
 * component JavaScript Library
 * https://github.com/zhangmhao/component
 *
 * Copyright 2013
 * Released under the MIT license
 *
 * Date: 2014-02-16T12:03Z
 */

(function (global, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'zepto', 'exports'], function(_, $, exports) {
            // others that may still expect a global Backbone.
            global.Com = factory(global, exports, $, _);
        });
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        //兼容CommonJS and CommonJS-like环境
        //此处参考jquery的做法
        var _ = require('underscore'), $;
        try { $ = require('zepto'); } catch(e) {}
        factory(global, exports, $, _);
    } else {
        global.Com = factory(global, {}, (global.jQuery || global.Zepto || global.ender || global.$), global._);
    }

// Pass this, window may not be defined yet
}(this, function (window, Com, $, _) {
    
/*jshint loopfunc: true */
/**
 * Class Module
 *
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 */
 

    var initializing = false,
        fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/,
        Class = function () {};
    // Create a new Class that inherits from this class
    Class.extend = function (prop) {
        var _super = this.prototype;
        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;
        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == 'function' &&
                typeof _super[name] == 'function' && fnTest.test(prop[name]) ?
                    (function (name, fn){
                        return function() {
                            var tmp = this._super;

                            // Add a new ._super() method that is the same method
                            // but on the super-class
                            this._super = _super[name];

                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;

                            return ret;
                        };
                    })(name, prop[name]) :
                    prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            // What’s especially important about this is that the init method could be 
            // running all sorts of costly startup code (connecting to a server, 
            // creating DOM elements, who knows) so circumventing this ends up working quite well.
            if (!initializing && this.init) {
                this.init.apply(this, arguments);
            }
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
/**
 * 组件序列号生成器
 */
var idGen = {
        id: 1e9,
        /**
         * 生成序列号
         * @return {String} 16进制字符串
         */
        gen: function () {
            return (this.id++).toString(16);
        }
    };

/**
 * 节点类
 */

    
    var R_CLONING = /^\*(.*)\*$/,
        Node;
    function getter(propName) {
        return function () {
            return this[propName];
        };
    }
    Node = Class.extend({
        type: 'component',
        updating: false,  //更新中
        initializing: false,  //初始化进行中
        initialized: false,  //已初始化

        /*-------- START OF GETTER -----*/

        getType: getter('type'),
        getId: getter('id'),

        /*---------- END OF GETTER -----*/

        /**
         * 组件构造函数, 组件的初始化操作
         * @param  {Object} option 组件配置
         *
         */
        init: function (option) {
            var self = this;
            //保存用户原始配置，已备用
            self.originOption = $.extend(true, {}, option);
            //为每一个组件组件实例赋予一个独立的sn
            self.sn = idGen.gen();
            //创建默认的ID，ID格式:{type}-{sn}
            self.id = [self.getType(), self.sn].join('-');
            self.initVar(['id', 'parentNode', 'nextNode', 'prevNode']);
        },
        /**
         * 添加节点
         * @param  {Node} node
         * @return {this}
         */
        appendChild: function (node) {
            if (!this.firstChild) {
                this.firstChild = this.lastChild = node;
            } else {
                node._linkNode({
                    prev: this.lastChild
                });
                this.lastChild = node;
            }
            return this;
        },
        /**
         * 删除节点
         * @param  {Node} nodeWillRemove  待删除节点
         * @return {this}
         */
        removeChild: function (nodeWillRemove) {
            var node = this.getChildById(nodeWillRemove.id);
            if (node) {
                node.destroy();
            }
            node = null;
            return this;
        },
        /**
         * 删除所有孩子节点
         * @return {Node} this
         */
        removeAllChild: function () {
            var children = this.firstChild;
            while(children) {
                children.destroy();
                children = children.nextNode;
            }
            this.firstChild = null;
            this.lastChild = null;
            return this;
        },
        /**
         * 析构
         */
        destroy: function () {
            //断开链表
            if (this.prevNode) {
                this.prevNode.nextNode = this.nextNode;
            } else {
                this.firstChild = this.nextNode;
            }
            if (this.nextNode) {
                this.nextNode.prevNode = this.prevNode;
            } else {
                this.lastChild = this.prevNode;
            }
            this.parentNode = null;
        },
        /**
         * 初始化组件的变量列表
         * @param  {Array} variableArray 需要初始化的变量名数组 
         *
         *         变量名格式: [*]{组件配置属性}[:{用户配置项属性}][*]
         *
         *         Note: '*' means need clone the object
         *
         *         如果组件的初始化配置option是:
         *         {
         *             name: 'hello',
         *             parent: this,
         *             identity: 'this/is/a/identity'
         *             state: {
         *                 data: {
         *                     ...
         *                 }
         *             }
         *         }
         *         initVar(['name', 'p:parent', 'id:identity', '*state*']) 
         *
         *         等同于下面4个语句:
         *
         *             this.name = option.name,
         *             this.p  = option.parent,
         *             this.id = option.identity,
         *             this.state = $.extend(true, {}, option.state);
         *
         * @return
         */
        initVar: function (variableArray) {
            var component = this,
                option = component.originOption;
            variableArray.forEach(function (element) {
                var cloneInfoArray = element.match(R_CLONING),
                    needClone = !!cloneInfoArray,
                    variableConfigArray = (needClone ? cloneInfoArray[1] : element).split(':'),
                    variableName = variableConfigArray[0],
                    optionKey = variableConfigArray[1] || variableName,
                    targetObj = option[optionKey];
                if (targetObj !== undefined) {
                    needClone = needClone && typeof targetObj === 'object';
                    component[variableName] = needClone ? $.extend(true, {}, targetObj)
                                                          : targetObj;
                }
            });
        },
        /**
         * 根据Id查找组件
         * @param  {String} id 组件编号
         * @return {Node/Null} 返回组件,找不到则返回Null
         */
        getChildById: function (id) {
            var node = this.firstChild;
            while (node) {
                if (node.id === id) {
                    return node;
                }
                node = node.nextNode;
            }
            return null;
        },
        /**
         * 将组件连接起来
         * 
         *               parentNode
         *                   |
         *     prevNode -> curNode -> nextNode
         *
         */
        _linkNode: function (nodeConfig) {
            var _prevNode = nodeConfig.prev || null,
                _nextNode = nodeConfig.next || null,
                _parentNode = nodeConfig.parent || null;
            if (_prevNode) {
                this.prevNode = _prevNode;
                _prevNode.nextNode = this;
            }
            if (_nextNode) {
                this.nextNode = _nextNode;
                _nextNode.preNode = this;
            }
            if (_parentNode) {
                this.parentNode = _parentNode;
            }
        }
    });
/**
 * 事件定义
 */

    
    var events = {
            BEFORE_RENDER: 'before:render',
            AFTER_RENDER: 'after:render',
            RENDERED: 'rendered'
        },
        Event = function () {};
    Event.register = function (key, value) {
        events[key] = value;
    };
    Event.add = function (type, userEvents) {
        $.each(userEvents, function (evtCode, evtName) {
            if (events[evtCode]) {
                throw new Error('[Model] Event Code:' + evtCode + 'is Already in pre-definded event list');
            }
            evtCode = [type, evtCode].join('_');
            Event.register(evtCode, evtName);
        });
    };
    Event.get = function (type, evtCode) {
        var event = events[evtCode] || events[[type, evtCode].join('_')],
            args = Array.prototype.slice.call(arguments, 2),
            itm;
        if (!event) {
            return null;
        }
        for (var i = 0, len = args.length; i < len; i++) {
            itm = args[i];
            if (!itm || typeof args[i] !== 'string') {
                args.splice(i, 1);
            }
        }
        args.push(event);
        return args.join(':');
    };
    /**
     * Events
     * 通过Mix的方式为其他对象提供事件机制
     * @example
     *     var obj = {};
     *     _.extend(obj, Events);
     *     object.on('run_forrest_gump', function() {
     *         console.log('forrest gump start running...')
     *     });
     *     object.trigger('run_forrest_gump')
     * @type {Object}
     */
    // var Events = {
    //     on: function() {

    //     },
    //     off: function () {

    //     }
    // };
/**
 * Template Module
 * original author: Dexter.Yy
 * https://github.com/dexteryy/OzJS/blob/master/mod/template.js
 */
/*jshint evil: true */

    

    var tplMethods,
        template = {};

    template.escapeHTML = function (str) {
        var xmlchar = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '\'': '&#39;',
            '"': '&quot;',
            '{': '&#123;',
            '}': '&#125;',
            '@': '&#64;'
        };
        str = str || '';

        return str.replace(/[&<>'"\{\}@]/g, function($1){
            return xmlchar[$1];
        });
    };

    /**
     * @public 按字节长度截取字符串
     * @param {string} str是包含中英文的字符串
     * @param {int} limit是长度限制（按英文字符的长度计算）
     * @param {function} cb返回的字符串会被方法返回
     * @return {string} 返回截取后的字符串,默认末尾带有"..."
     */
    template.substr = function (str, limit, cb) {
        var sub;
        if(!str || typeof str !== 'string') {
            return '';
        }

        sub = str.substr(0, limit).replace(/([^\x00-\xff])/g, '$1 ')
            .substr(0, limit).replace(/([^\x00-\xff])\s/g, '$1');

        return cb ? cb.call(sub, sub) : (str.length > sub.length ? sub + '...' : sub);
    };

    template.trueSize = function (str) {
        return str.replace(/([^\x00-\xff]|[A-Z])/g, '$1 ').length;
    };

    template.str2html = function (str) {
        var temp = document.createElement('div'),
            child, fragment;
        temp.innerHTML = str;
        child = temp.firstChild;
        if (temp.childNodes.length === 1) {
            return child;
        }

        fragment = document.createDocumentFragment();
        do {
            fragment.appendChild(child);
            child = temp.firstChild;
        } while (child);
        return fragment;
    };

    // From Underscore.js
    // JavaScript micro-templating, similar to John Resig's implementation.
    template.tplSettings = {
        cache: {},
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%([\s\S]+?)%>/g
    };

    tplMethods = {
        escapeHTML: template.escapeHTML,
        substr: template.substr,
        include: tmpl
    };

    function tmpl(str, data, helper) {
        var settings = template.tplSettings,
            tplContent, func,
            result = '';
        helper = _.extend({}, tplMethods, helper);
        if (!/[<>\t\r\n ]/.test(str)) {
            func = settings.cache[str];
            if (!func) {
                tplContent = document.getElementById(str);
                if (tplContent) {
                    func = settings.cache[str] = tmpl(tplContent.innerHTML);
                }
            }
        } else {
            func = new Function('data', 'helper', 'var __tpl="";__tpl+="' +
                str.replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"')
                    //replace code <%=data.name%>
                    .replace(settings.interpolate, function(match, code) {
                        var objKeyArray = code.split('.'),
                            objItem = data;
                        _.each(objKeyArray, function (value, index) {
                            objItem = objItem[value];
                        });
                        var execute = code.replace(/\\"/g, '"') +
                           (typeof objItem === 'function' ? '()' : '');
                        return '"+data.' + execute + '+"';
                    })
                    // .replace(settings.evaluate || null, function(match, code) {
                    //     return '";' + code.replace(/\\"/g, '"')
                            // .replace(/[\r\n\t]/g, ' ') + '__tpl+="';
                    // })
                    .replace(/\r/g, '\\r')
                    .replace(/\n/g, '\\n')
                    .replace(/\t/g, '\\t') +
                '";return __tpl;');
        }
        if (func) {
            if (arguments.length > 1) {
                result = func(data, helper);
            } else {
                result = func;
            }
        }
        return result;
    }

    template.tmpl = tmpl;
    template.reload = function(str){
        delete template.tplSettings.cache[str];
    };
/**
 * 显示类
 * @extend Component{base/Component}
 */

    
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
                'userUpdate:update',
                'className',
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
                throw new Error('component [' + this.getId() + '] has no parentNode or parentEl, should have one of those at least');
            }
            //初始化参数
            self.state = self.getState();
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
            return this.state || null;
        },
        _isComNeedUpdate: function (component) {
            return component._isStateChange(component.getState()) && component.rendered;
        },
        /**
         * 更新组件
         * @param  {[type]} state [description]
         * @param  {[type]} data  [description]
         * @return {[type]}       [description]
         */
        update: function (data) {
            //更新组件的子组件
            var component = this.firstChild;
            if (this.userUpdate && this._isComNeedUpdate(this)) {
                this.userUpdate(data);
            }
            while (component) {
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
                state;
            while (node) {
                statusStr = '';
                state = node.state;
                if (state) {
                    statusArray = [];
                    $.each(state, pushStatusArray);
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
        _isStateChange: function (newState) {
            if (!_.isEqual(newState, this.state)) {
                this.state = newState;
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
                        // state: self.state,
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
}));
