/*!
 * Com v0.1.1
 * component JavaScript Library
 * https://github.com/zhangmhao/component
 *
 * Copyright 2013
 * Released under the MIT license
 *
 * Date: 2014-03-20T09:38Z
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
    
/**
 * 辅助类
 */

    var _ = {},
        class2type = {},
        toString = class2type.toString,
        slice = Array.prototype.slice,
        nativeKeys = Object.keys,
        isArray = Array.isArray ||
            function(object) {
                return object instanceof Array;
        };

    function type(obj) {
        return obj == null ? String(obj) :
            class2type[toString.call(obj)] || "object";
    }

    function isFunction(value) {
        return type(value) == "function";
    }

    function isWindow(obj) {
        return obj != null && obj == obj.window;
    }

    function isObject(obj) {
        return type(obj) == "object";
    }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
    }

    function extend(target, source, deep) {
        for (var key in source) {
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                    target[key] = {};
                }
                if (isArray(source[key]) && !isArray(target[key])) {
                    target[key] = [];
                }
                extend(target[key], source[key], deep);
            } else if (source[key] !== undefined) {
                target[key] = source[key];
            }
        }
    }

    _.isEmpty = function(obj) {
        if (obj == null) {
            return true;
        }
        if (isArray(obj) || _.isString(obj)) {
            return obj.length === 0;
        }
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    };
    _.keys = function(obj) {
        if (!isObject(obj)) {
            return [];
        }
        if (nativeKeys) {
            return nativeKeys(obj);
        }
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };

    _.extend = function(target) {
        var deep, args = slice.call(arguments, 1);
        if (typeof target == 'boolean') {
            deep = target;
            target = args.shift();
        }
        args.forEach(function(arg) {
            extend(target, arg, deep);
        });
        return target;
    };
    var eq = function(a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) {
            return a !== 0 || 1 / a == 1 / b;
        }
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null) {
            return a === b;
        }
        // Unwrap any wrapped objects.
        if (a instanceof _) {
            a = a._wrapped;
        }
        if (b instanceof _) {
            b = b._wrapped;
        }
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className != toString.call(b)) {
            return false;
        }
        switch (className) {
            // Strings, numbers, dates, and booleans are compared by value.
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return a == String(b);
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
                // other numeric values.
                return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a == +b;
                // RegExps are compared by their source patterns and flags.
            case '[object RegExp]':
                return a.source == b.source &&
                    a.global == b.global &&
                    a.multiline == b.multiline &&
                    a.ignoreCase == b.ignoreCase;
        }
        if (typeof a != 'object' || typeof b != 'object') {
            return false;
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] == a) {
                return bStack[length] == b;
            }
        }
        // Objects with different constructors are not equivalent, but `Object`s
        // from different frames are.
        var aCtor = a.constructor,
            bCtor = b.constructor;
        if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
            _.isFunction(bCtor) && (bCtor instanceof bCtor)) && ('constructor' in a && 'constructor' in b)) {
            return false;
        }
        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);
        var size = 0,
            result = true;
        // Recursively compare objects and arrays.
        if (className == '[object Array]') {
            // Compare array lengths to determine if a deep comparison is necessary.
            size = a.length;
            result = size == b.length;
            if (result) {
                // Deep compare the contents, ignoring non-numeric properties.
                while (size--) {
                    if (!(result = eq(a[size], b[size], aStack, bStack))) {
                        break;
                    }
                }
            }
        } else {
            // Deep compare objects.
            for (var key in a) {
                if (a.hasOwnProperty(key)) {
                    // Count the expected number of properties.
                    size++;
                    // Deep compare each member.
                    if (!(result = b.hasOwnProperty(key) && eq(a[key], b[key], aStack, bStack))) {
                        break;
                    }
                }
            }
            // Ensure that both objects contain the same number of properties.
            if (result) {
                for (key in b) {
                    if (b.hasOwnProperty(key) && !(size--)) {
                        break;
                    }
                }
                result = !size;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return result;
    };

    // Perform a deep comparison to check if two objects are equal.
    _.isEqual = function(a, b) {
        return eq(a, b, [], []);
    };

    _.isString = function(obj) {
        return toString.call(obj) == '[object String]';
    };
    _.isFunction = isFunction;
    _.isArray = isArray;
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
        gen: function (prefix) {
            return (prefix || '') + (this.id++).toString(16);
        }
    };

/**
 * 节点类
 */

    
    var R_CLONING = /^\*(.*)\*$/,
        Node;

    function getter(propName) {
        return function() {
            return this[propName];
        };
    }
    var eventSplitter = /\s+/;
    /**
     * eventApi
     * 兼容多事件名 'click touch'
     * 兼容jquery式事件回调
     * {
     *     click: bar
     *     touch: foo
     * }
     * @params {Object} obj  上下文
     * @params {String} action 函数名称 如on,trigger,off
     * @params {String/Object} name 事件名称
     * @params {Array} 传入给函数执行的参数
     */
    var eventsApi = function(obj, action, name, rest) {
        if (!name) {
            return true;
        }
        if (typeof name === 'object') {
            for (var key in name) {
                obj[action].apply(obj, [key, name[key]].concat(rest));
            }
            return false;
        }
        if (eventSplitter.test(name)) {
            var names = name.split(eventSplitter);
            for (var i = 0, l = names.length; i < l; i++) {
                obj[action].apply(obj, [names[i]].concat(rest));
            }
            return false;
        }

        return true;
    };
    /**
     * triggerevent
     * @params {Array} events 事件回调函数数组
     * @params {Array} args 传入回调函数的参数
     */
    var triggerEvent = function(events, args) {
        var ev, i = -1,
            l = events.length,
            a1 = args[0],
            a2 = args[1],
            a3 = args[2];
        //switch提高函数性能
        switch (args.length) {
            case 0:
                while (++i < l) {
                    (ev = events[i]).callback.call(ev.ctx);
                }
                return;
            case 1:
                while (++i < l) {
                    (ev = events[i]).callback.call(ev.ctx, a1);
                }
                return;
            case 2:
                while (++i < l) {
                    (ev = events[i]).callback.call(ev.ctx, a1, a2);
                }
                return;
            case 3:
                while (++i < l) {
                    (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
                }
                return;
            default:
                while (++i < l) {
                    (ev = events[i]).callback.apply(ev.ctx, args);
                }
                return;
        }
    };

    Node = Class.extend({
        type: 'component',
        updating: false, //更新中
        initializing: false, //初始化进行中
        initialized: false, //已初始化

        /*-------- START OF GETTER -----*/

        getType: getter('type'),
        getId: getter('id'),

        /*---------- END OF GETTER -----*/

        /**
         * 组件构造函数, 组件的初始化操作
         * @param  {Object} option 组件配置
         *
         */
        init: function(option) {
            var self = this;
            //保存用户原始配置，已备用
            self.originOption = _.extend({}, option, true);
            //为每一个组件组件实例赋予一个独立的sn
            self.sn = idGen.gen();
            //创建默认的ID，ID格式:{type}-{sn}
            self.id = [self.getType(), self.sn].join('-');
            self.nodeCount = 0;
            self.initVar(['id', 'parentNode', 'nextNode', 'prevNode']);
        },
        /**
         * 添加节点
         * @param  {Node} node
         * @return {this}
         */
        appendChild: function(node) {
            var self = this;
            _.isArray(node) || (node = [node]);
            node.forEach(function (n) {
                if (!self.firstChild) {
                    self.firstChild = self.lastChild = n;
                    n._linkNode({
                        parent: self
                    });
                } else {
                    n._linkNode({
                        prev: self.lastChild,
                        parent: self
                    });
                    self.lastChild = n;
                }
                self.nodeCount++;
            });
            return this;
        },
        /**
         * 删除节点
         * @param  {Node} nodeWillRemove  待删除节点
         * @return {this}
         */
        removeChild: function(nodeWillRemove) {
            var node = this.getChildById(nodeWillRemove.id);
            if (node) {
                node.destroy();
            }
            this.nodeCount--;
            node = null;
            return this;
        },
        /**
         * 删除所有孩子节点
         * @return {Node} this
         */
        removeAllChild: function() {
            var children = this.firstChild;
            while (children) {
                children.destroy();
                this.nodeCount--;
                children = children.nextNode;
            }
            this.firstChild = null;
            this.lastChild = null;
            return this;
        },
        /**
         * 析构
         */
        destroy: function() {
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
        initVar: function(variableArray) {
            var component = this,
                option = component.originOption;
            variableArray.forEach(function(element) {
                var cloneInfoArray = element.match(R_CLONING),
                    needClone = !! cloneInfoArray,
                    variableConfigArray = (needClone ? cloneInfoArray[1] : element).split(':'),
                    variableName = variableConfigArray[0],
                    optionKey = variableConfigArray[1] || variableName,
                    targetObj = option[optionKey];
                if (targetObj !== undefined) {
                    needClone = needClone && typeof targetObj === 'object';
                    component[variableName] = needClone ?
                        _.extend({}, targetObj, true) : targetObj;
                }
            });
        },
        /**
         * 根据Id查找组件
         * @param  {String} id 组件编号
         * @return {Node/Null} 返回组件,找不到则返回Null
         */
        getChildById: function(id) {
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
        _linkNode: function(nodeConfig) {
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
        },
        /**
         * on
         * @param {String} name 事件名称
         * @param {Function} callback 事件回调函数
         * @param {Object} context 指定回调函数上下文
         * @return this
         */
        on: function(name, callback, context) {
            if (!eventsApi(this, 'on', name, [callback, context]) || !callback) {
                return this;
            }
            this._events || (this._events = {});
            var events = this._events[name] || (this._events[name] = []);
            events.push({
                callback: callback,
                context: context,
                ctx: context || this
            });
            return this;
        },
        /**
         * off
         * 解绑函数，解除事件绑定
         * this.off()表示解绑所有事件
         * this.off(null, callback) 表示解绑事件回调函数为callback的所有事件
         * this.off('click', callback) 表示解绑回调函数为callback的click事件
         * this.off('click', callback, context) 解绑上下文为context，回调函数为callback的click事件
         * @param {String} name 事件名称
         * @param {Function} callback 事件回调函数
         * @param {Object} context 指定回调函数上下文
         * @return this
         */
        off: function(name, callback, context) {
            if (!this._events || !eventsApi(this, 'off', name, [callback, context])) {
                return this;
            }
            //this.off()的用法则解绑所有事件绑定
            if (!name && !callback && !context) {
                this._events = void 0;
                return this;
            }
            var names = name ? [name] : _.keys(this._events),
                events,
                retain;
            for (var i = 0, len = names.length; i < len; i++) {
                name = names[i];
                if ((events = this._events[name])) {
                    this._events[name] = retain = [];
                    if (callback || context) {
                        for (var j = 0, evt, eventsLen = events.length; j < eventsLen; j++) {
                            evt = events[j];
                            if ((callback && evt.callback !== callback) ||
                                (context && evt.context !== context)) {
                                retain.push(evt);
                            }

                        }
                    }
                }
                if (retain.length === 0) {
                    delete this._events[name];
                }
            }
            return this;
        },
        /**
         * trigger
         * 触发事件
         * @params {String} name 事件名称
         */
        trigger: function(name) {
            if (!this._events) {
                return this;
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (!eventsApi(this, 'trigger', name, args)) {
                return false;
            }
            var events = this._events[name];
            if (events) {
                triggerEvent(events, args);
            }
        },
        /**
         * listenTo
         *
         * 為了方便解綁，避免管理事件綁定混亂失效造成的洩露,出現所謂的Zombie Object
         * @params {Node} node 節點
         * @params {String} name 事件名稱
         * @params {Function} callback 事件回調函數
         */
        listenTo: function (node, name, callback) {
            var listeningTo = this._listeningTo || (this._listeningTo = []);

            listeningTo.push(node);
            //形如{click: foo, touch: bar}的事件綁定方式
            if (!callback && typeof name === 'object') {
                callback = this;
            }
            node.on(name, callback, this);
            return this;
        },
        /**
         * stoplistening
         *
         * 通知節點停止監聽特定的事件，或者停止監聽正在監聽中的其他節點
         * @params {Node} node 節點
         * @params {String} name 事件名稱
         * @params {Function} callback 事件回調函數
         */
        stopListening: function (node, name, callback) {
            var remove = !name && !callback,
                listeningTo = this.listeningTo;
            if (node) {
                listeningTo = [node];
            }
            if (!callback && typeof name === 'object') {
                callback = this;
            }
            for(var i = 0, itm, l = listeningTo.length; i < l; i++) {
                itm = listeningTo[i];
                itm.off(name, callback, this);
                if (remove || _.isEmpty(itm._events)) {
                    listeningTo.splice(i, 1);
                }
            }
            return this;
        }
    });
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
                        objKeyArray.forEach(function (value) {
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
        DisplayComponent;
    //添加事件
    var BEFORE_RENDER_FIRST_COMPONENT = 'beforerender:firstcomponent',
        BEFORE_RENDER = 'beforerender',
        AFTER_RENDER = 'afterrender';
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
            self._data = option.data;
            self.uiEvents = _.extend(self.uiEvents || {}, option.uiEvents);
            self._cpConstructors = self.components;
            self._initParent(self.parentNode);
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
                self.appendChild(self._buildComponents());
                //之前被通知过render，模板准备好之后进行渲染
                if (self.needToRender) {
                    self.render();
                }
            });
        },
        /**
         * 初始化Parent
         */
        _initParent: function () {
            var parentNode = this.parentNode;
            if (this.parentEl) {
                this.$parentEl = $(this.parentEl);
            } else if (parentNode) {
                this.parentEl = parentNode.el;
                this.$parentEl = parentNode.$el;
            } else {
                //throw new Error('component [' + this.getId() + '] has no parentNode or parentEl, should have one of those at least');
                console.log('失败:' + this.id);
            }
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
                    self.trigger(BEFORE_RENDER, self);
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
            return _.extend({}, this._data || {}, {
                _state_: this.state,
                _id_: this.id
            });
        },
        _isComNeedUpdate: function (component) {
            return component._isStateChange(component.getState()) && component.rendered;
        },
        _changeEl: function ($el) {
            this.el = $el[0];
            this.$el = $el;
        },
        _changeParentEl: function ($dom) {
            this.parentEl = $dom[0];
            this.$parentEl = $dom;
        },
        _rebuildDomTree: function (isRoot) {
            var component = this.firstChild;
            this._changeEl(this._$tempEl);
            if (!isRoot) {
                this._changeParentEl(this.parentNode.$el);
            }
            while (component) {
                component._rebuildDomTree(false);
                component = component.nextNode;
            }
            delete this._$tempEl;
        },
        /**
         * 更新组件
         * @return {Object} this
         */
        update: function () {
            //首先自我更新，保存到临时_$tempEl中
            this.updating = true;
            this.state = this.getState();
            this._$tempEl = $(this.tmpl());
            var component = this.firstChild;
            while (component) {
                component.update();
                component = component.nextNode;
            }
            if (this.parentNode == null || !this.parentNode.updating) {
                this.parentEl.replaceChild(this._$tempEl[0], this.el);
                this._rebuildDomTree(true);
            } else {
                this.parentNode._$tempEl.append(this._$tempEl);
            }
            this.updating = false;
            return this;
        },
        /**
         * 添加组件
         * @param  {Array/DisplayComponent} comArray
         */
        appendChild: function (comArray) {
            var self = this;
            if (!comArray) {
                return;
            }
            this._super(comArray);
            var com = self.firstChild,
                onBeforeRender = function (component) {
                    //组件还没有渲染
                    if (!self._allowToRender(component)) {
                        component.isContinueRender = false;
                    } else {
                        if (!component.prevNode) {
                            self.trigger(BEFORE_RENDER_FIRST_COMPONENT, self);
                        }
                        // isContinueRender 表示执行下面的Render
                        component.isContinueRender = true;
                    }
                };
            while (com) {
                com._initParent();
                com.on(BEFORE_RENDER, onBeforeRender);
                com = com.nextNode;
            }
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
                    'please check your option',
                    '模板的内容为空，请检查模板文件是否存在,或者模板加载失败'
                    ].join(' '));
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
         * 获取组件在层级关系中的位置
         * @return {String} 生成结果index/recommend/app12
         */
        getAbsPath: function () {
            var pathArray = [],
                node = this,
                statusArray,
                statusStr,
                state;
            while (node) {
                statusStr = '';
                state = node.state;
                if (state) {
                    statusArray = [];
                    for (var key in state) {
                        statusArray.push(state[key]);
                    }
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
            this.trigger(AFTER_RENDER, this);
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
         * 组件状态是否有改变
         * @param  {Object}  newParams 组件的新状态
         * @return {Boolean}
         */
        _isStateChange: function (newState) {
            if (!_.isEqual(newState, this.state)) {
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
            if (_.isArray(cpConstructors)) {
                for (var i = 0, len = cpConstructors ? cpConstructors.length : 0; i < len; i++) {
                    cItm = cpConstructors[i];
                    //构造函数
                    if (typeof cItm === 'function') {
                        Component = cItm;
                    //构造函数以及组件详细配置
                    } else if (typeof cItm === 'object' && cItm._constructor_) {
                        Component = cItm._constructor_;
                    //已经创建好的组件实例
                    } else if (cItm instanceof Node) {
                        components.push(cItm);
                        continue;
                    //检查到错误，提示使用者
                    } else {
                        throw new Error('Component\'s component config is not right');
                    }
                    //创建组件
                    cp = new Component(_.extend({
                        parentNode: self
                    }, cItm/*cItm为组件的配置*/));
                    components.push(cp);
                }
                return components;
            } else {
                //对于配置: components 'component/componentName'
                //表示所有的组件都是由该类型组件构成
                //todo 由于这里的应用场景有限，所以为了代码大小考虑，
                //为了保证功能尽可能简单，暂时不做这部分开发（考虑传入的
                //是构造函数和组件文件地址的情况）
                return null;
            }
            return null;
        }
    });
    //扩展方法 'show', 'hide', 'toggle', 'appendTo', 'append', 'empty'
    ['show', 'hide', 'toggle', 'empty'].forEach(function (method) {
        DisplayComponent.prototype[method] = function () {
            var args = slice.call(arguments);
            this.$el[method].apply(this.$el, args);
            return this;
        };
    });
    return DisplayComponent;
}));
