/*!
 * Com v0.1.1
 * component JavaScript Library
 * https://github.com/zhangmhao/component
 *
 * Copyright 2013
 * Released under the MIT license
 *
 * Date: 2014-04-04T08:55Z
 */

(function (global, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['exports'], function(exports) {
            // others that may still expect a global Backbone.
            global.Com = factory(global, exports);
        });
    } else if (typeof define === 'function') {
        define(function(require, exports, module) {
            module.exports = global.Com = factory(global, exports);
        });
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        //兼容CommonJS and CommonJS-like环境
        //此处参考jquery的做法
        //var _ = require('underscore'), $;
        ///try { $ = require('zepto'); } catch(e) {}
        factory(global, module.exports);
    } else {
        global.Com = factory(global, {}, (global.jQuery || global.Zepto || global.ender || global.$), global._);
    }

// Pass this, window may not be defined yet
}(this, function (window, Com) {
    

/**
 * 辅助类
 */

    // Create a safe reference to the Underscore object for use below.
    var _ = function(obj) {
        if (obj instanceof _) {
            return obj;
        }
        if (!(this instanceof _)) {
            return new _(obj);
        }
        this._wrapped = obj;
    };
    var class2type = {},
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
    _.each = function(elements, callback) {
        var i, key;
        if (isArray(elements)) {
            for (i = 0; i < elements.length; i++) {
                if (callback.call(elements[i], i, elements[i]) === false) {
                    return elements;
                }
            }
        } else {
            for (key in elements) {
                if (callback.call(elements[key], key, elements[key]) === false) {
                    return elements;
                }
            }
        }
        return elements;
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

    
    var slice = Array.prototype.slice,
        R_CLONING = /^\*(.*)\*$/,
        Node;

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
        type: 'node',
        updating: false, //更新中
        initializing: false, //初始化进行中
        initialized: false, //已初始化
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
            self.id = [self.type, self.sn].join('-');
            self.nodeCount = 0;
            self.initVar(['id', 'parentNode', 'nextNode', 'prevNode']);
            //self.initVar(_.keys(option));
        },
        /**
         * 添加节点
         * @param  {Node} node
         * @return {this}
         */
        appendChild: function(nodes) {
            var self = this;
            _.isArray(nodes) || (nodes = [nodes]);
            //建立子节点链表
            nodes.forEach(function(n) {
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
            this.stopListening();
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
         * getChildByFilter
         * @params {Function} fileter 过滤器
         */
        getChildByFilter: function(filter) {
            var node = this.firstChild,
                result = [];
            while (node) {
                if (filter(node)) {
                    result.push(node);
                }
                result = result.concat(node.getChildByFilter(filter));
                node = node.nextNode;
            }
            return result;
        },
        /**
         * 根据Id查找组件
         * @param  {String} id 组件编号
         * @return {Node/Null} 返回组件,找不到则返回Null
         */
        getChildById: function(id) {
            var result = this.getChildByFilter(function(node) {
                return node.id === id;
            });
            //返回唯一的一个 或者 null
            return result[0] || null;
        },
        /**
         * 根据Type查找组件
         * @param  {String} id 组件编号
         * @return {Node/Null} 返回组件,找不到则返回Null
         */
        getChildByType: function(type) {
            return this.getChildByFilter(function(node) {
                return node.type === type;
            });
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
        trigger: function(evt) {
            var args, name;
            if (!this._events) {
                return this;
            }
            if (typeof evt === 'string') {
                name = evt;
                args = [{
                    name: evt,
                    src: this,
                    cur: this,
                }].concat(slice.call(arguments, 1));
            } else {
                name = evt.name;
                args = slice.call(arguments, 0);
            }
            if (!eventsApi(this, 'trigger', name, args)) {
                return false;
            }
            var events = this._events[name],
                allEvents = this._events.all;
            if (events && typeof evt === 'string') {
                triggerEvent(events, args);
            } else if (events) {
                console.log(this.id + '没有' + args[0].name);
            }
            if (allEvents) {
                triggerEvent(allEvents, args);
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
        listenTo: function(node, name, callback) {
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
        stopListening: function(node, name, callback) {
            var remove = !name && !callback,
                listeningTo = this._listeningTo;
            if (!listeningTo) {
                return this;
            }
            if (node) {
                listeningTo = [node];
            }
            if (!callback && typeof name === 'object') {
                callback = this;
            }
            for (var i = listeningTo.length - 1, itm; i >= 0; i--) {
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
                        var execute = code.replace(/\\"/g, '"');
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
        emptyFunc = function() {},
        eventSpliter = ':',
        DisplayComponent;
    //添加事件
    var BEFORE_RENDER_FIRST_COMPONENT = 'beforerender_first_com',
        BEFORE_RENDER = 'beforerender',
        AFTER_RENDER = 'afterrender',
        BEFORE_TMPL = 'beforetmpl',
        STATE_CHANGE = 'statechange';
    //获取MatchesSelector
    var div = document.createElement("div"),
        matchesSelector = ["moz", "webkit", "ms", "o"].filter(function(prefix) {
            return prefix + "MatchesSelector" in div;
        })[0] + "MatchesSelector";

    var returnTrue = function() {
            return true;
        },
        returnFalse = function() {
            return false;
        },
        ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
        eventMethods = {
            preventDefault: 'isDefaultPrevented',
            stopImmediatePropagation: 'isImmediatePropagationStopped',
            stopPropagation: 'isPropagationStopped'
        };

    /**
     * appendPxIfNeed
     * 为数字添加单位 'px'
     * @params {Number/String} value 数量
     * @return {String} 添加了单位的数量
     */
    function appendPxIfNeed(value) {
        return value += typeof value === 'number' ? 'px' : '';
    }


    /**
     * setCss
     * @params {Dom} el Dom节点
     * @params {Object} properties css属性对象
     */
    function setCss(el, properties) {
        el.style.cssText += ';' + getStyleText(properties);
    }

    /**
     * getStyleText
     * 根据object获取css定义文本
     * @example
     *   输入： { height: 300}
     *   输出： height:300px;
     * @params {Object} properties css属性对象
     * @return {String} css定义文本
     */
    function getStyleText(properties) {
        var css = '';
        for (var key in properties) {
            css += key + ':' + appendPxIfNeed(properties[key]) + ';';
        }
        return css;
    }


    //用于兼容用户HTML字符串不完整 例如 <tr></tr>
    var table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        containers = {
            'tr': document.createElement('tbody'),
            'tbody': table, 'thead': table, 'tfoot': table,
            'td': tableRow, 'th': tableRow,
            '*': document.createElement('div')
        };


    /**
     * createElement
     * 根据HTML文本创建Dom节点，兼容一些错误处理，参考Zepto
     * @Params {String} html html字符串
     * @return {Array} dom数组
     */
    function createElement(html) {
        var tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
            singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
            fragmentRE = /^\s*<(\w+|!)[^>]*>/,
            container,
            name,
            dom;
        // 对于单个标签的进行优化 例如<div></div>
        if (singleTagRE.test(html)) {
            dom = [document.createElement(RegExp.$1)];
        }
        //提取出标签名称
        if (name === undefined) {
            name = fragmentRE.test(html) && RegExp.$1;
        }
        //替换非法的半闭合标签，合法的有br hr img 等，详见tagExpanderRE
        if (html.replace) {
            html = html.replace(tagExpanderRE, "<$1></$2>");
        }
        if (!(name in containers)) {
            name = '*';
        }
        container = containers[name];
        container.innerHTML = '' + html;
        dom = container.childNodes;
        return dom;
    }


    function compatible(ev, source) {
        if (source || !ev.isDefaultPrevented) {
            source || (source = ev);

            _.each(eventMethods, function(name, predicate) {
                var sourceMethod = source[name];
                ev[name] = function() {
                    this[predicate] = returnTrue;
                    return sourceMethod && sourceMethod.apply(source, arguments);
                };
                ev[predicate] = returnFalse;
            });

            if (source.defaultPrevented !== undefined ?
                    source.defaultPrevented :
                    'returnValue' in source ?
                            source.returnValue === false :
                            source.getPreventDefault &&
                            source.getPreventDefault()) {
                    ev.isDefaultPrevented = returnTrue;
            }
        }
        return ev;
    }


    /**
     * 创建事件代理
     * 由于事件机制中的Event变量是只读的，但是托管（delegate）的时候需要修改
     * currentTarget,所以只能创建事件代理，这个代理中又所有的event属性.
     */
    function createProxy(ev) {
        var key, proxy = {
                originalEvent: ev
            };
        for (key in ev) {
            if (!ignoreProperties.test(key) && ev[key] !== undefined) {
                proxy[key] = ev[key];
            }
        }
        return compatible(proxy, ev);
    }


    /**
     * 显示节点类
     *
     * 可以运行于浏览器中，可以根据需要来自定义自己的组件。通过组合和继承来创建出
     * 需要的web应用
     *
     * @extend Node
     */
    DisplayComponent = Node.extend({
        type: 'display',
        /*------- Status --------*/
        tplDowloading: false, //下载模板中
        rendered: false, //已渲染
        /*-------- Flag ---------*/
        display: true, //是否显示组件
        getState: function() {
            return null;
        },
        /**
         * 构造函数
         * @params {object} option 组件配置项
         * @example
         * {
         *    id: 'test-id'
         *    className: 'test-class',
         *    getState: function () {
         *        return {
         *            state: 'this is a state';
         *        }
         *    }
         * }
         *
         */
        init: function(option) {
            var self = this;
            self._super(option);
            self.state = {};
            self._notFinishListener = {};
            self.initVar([
                'tpl',
                'tplContent',
                'components',
                'parentNode',
                'parentEl',
                '*env*',
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
            self._listen(self.listeners);
            self._listen(option.listeners);
            var el = self.el;
            if (!el) {
                self._initHTMLElement(function(el) {
                    self.el = el;
                    el.setAttribute('id', self.id);
                    self.className && el.setAttribute('class', self.className);
                    //添加新建的子组件到组件中
                    self.appendChild(self._buildComponents());
                    //监听组件原生listener
                    //用户创建的Listener
                    self._bindUIEvent();
                    //之前被通知过render，模板准备好之后进行渲染
                    if (self.needToRender) {
                        self.render();
                    }
                });
            }
        },
        /**
         * 初始化Parent
         * @private
         */
        _initParent: function() {
            var parentNode = this.parentNode;
            //指定了parentNode 没有指定parentEl
            if (parentNode && !this.parentEl) {
                this.parentEl = parentNode.el;
            }
        },
        /**
         * 渲染组件
         */
        render: function() {
            var self = this,
                originOption = self.originOption,
                firstChild = self.firstChild,
                component = firstChild;
            //trigger event beforerender
            self.trigger(BEFORE_RENDER, self);
            //先渲染组件的子组件
            var fragment = document.createDocumentFragment();
            while (component) {
                if (!component.selector) {
                    fragment.appendChild(component.render().el);
                } else {
                    component._finishRender();
                }
                component = component.nextNode;
            }
            this.el.appendChild(fragment);
            //然后再渲染组件本身，这样子可以尽量减少浏览器的重绘
            //有selector则表明该元素已经在页面上了，不需要再渲染
            //如果在before render的处理函数中将isContinueRender置为true
            //则停止后续执行,后续考虑使用AOP改造此方式
            if (self.isContinueRender !== false) {
                self.isContinueRender = true;
                setCss(self.el, {
                    width: originOption.width,
                    height: originOption.height
                });
                if (self.display === false) {
                    setCss(self.el, {'display': 'none'});
                }
                self._finishRender();
            }
            return self;
        },
        /**
         * 获取组件的数据
         * @return {Object}
         */
        getData: function() {
            return _.extend({}, this._data || {}, {
                _state_: this.state,
                _id_: this.id
            });
        },
        /**
         * 查询组件是否需要更新
         * 如果组件的状态发生改变，则需要更新
         * @return {Boolean} true:需要 ,false:不需要
         */
        needUpdate: function() {
            return this._isStateChange(this.getState());
        },
        /**
         * 改变节点Dom元素
         * @private
         */
        _changeEl: function(el) {
            this.el = el;
        },
        /**
         * 改变节点父节点Dom元素
         * @private
         */
        _changeParentEl: function(el) {
            this.parentEl = el;
        },
        /**
         * _rebuildDomTree
         * 重新构建组件Dom树
         * @private
         * @params {Boolean} isRoot 标志是否为根节点
         */
        _rebuildDomTree: function(isRoot) {
            var component = this.firstChild;
            this._changeEl(this._tempEl || this.el);
            //非根节点需要更新ParentNode
            if (!isRoot) {
                this._changeParentEl(this.parentNode.el);
            }
            while (component) {
                component._rebuildDomTree(false);
                component = component.nextNode;
            }
            delete this._tempEl;
        },
        /**
         * 更新操作
         * 更新自身，及通知子组件进行更新
         * @return {Object} this
         */
        update: function() {
            //首先自我更新，保存到临时_tempEl中
            this.updating = true;
            var newState = this.getState(),
                tempEl,
                stateChange;
            if ((stateChange = this._isStateChange(newState))) {
                this.state = newState;
                this.trigger(STATE_CHANGE, newState);
                this._tempEl = tempEl = createElement(this.tmpl())[0];
                tempEl.setAttribute('id', this.id);
                if (this.className) {
                    tempEl.setAttribute('class', this.className);
                }
            }
            var component = this.firstChild;
            //通知子组件更新
            while (component) {
                component.update();
                component = component.nextNode;
            }
            //如果为根节点Root
            if (this.parentNode == null) {
                if (tempEl) {
                    this.parentEl.replaceChild(this._tempEl, this.el);
                }
                this._rebuildDomTree(true);
            } else {
                var pNode = this.parentNode,
                    pNewEl = pNode._tempEl,
                    pEl = pNode.el;
                //pNewEl不为空，表示父节点更新了，则子节点要append To Parent
                if (pNewEl) {
                    //如果有了selector，表示组件的dom已经在父节点中了，不需要添加
                    //详细参考selector的定义
                    if (!this.selector) {
                        //添加更新后的组件Dom或原dom（组件不需要更新）
                        pNewEl.appendChild(tempEl || this.el);
                    }
                //父节点不需要更新, 则父节点Replace子节点即可
                } else {
                    pEl.replaceChild(tempEl, this.el);
                    this._changeEl(tempEl);
                    delete this._tempEl;
                }
            }
            this.updating = false;
            return this;
        },
        /**
         * 添加组件
         * @param  {Array/DisplayComponent} comArray
         */
        appendChild: function(comArray) {
            var self = this;
            if (!comArray) {
                return;
            }
            _.isArray(comArray) || (comArray = [comArray]);
            var onBeforeRender = function(evt, component) {
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
            var index = comArray.length - 1,
                evt,
                identity,
                com;
            while (index >= 0) {
                com = comArray[index--];
                com.parentNode = this;
                com._initParent();
                com._bindUIEvent();
                //绑定待监听事件，类似于延迟监听，
                //因为listener中所要监听的组件在那个时刻还没有存在
                identity = [com.type, com.id].join(eventSpliter);
                evt = this._notFinishListener[identity];
                if (evt) {
                    this.listenTo(com, evt);
                    delete this._notFinishListener[identity];
                }
                com.on(BEFORE_RENDER, onBeforeRender);
                com = com.nextNode;
            }
            this._super(comArray);
        },
        /**
         * 渲染模板
         * @params {String} tplContent 模板内容
         * @params {Object} data 渲染数据
         */
        tmpl: function(tplContent, data) {
            var self = this,
                tplCompile = self._tplCompile,
                html;
            tplContent = tplContent || self.tplContent;
            data = data || self.getData();
            this.trigger(BEFORE_TMPL, data);
            if (tplContent) {
                if (!tplCompile) {
                    this._tplCompile = tplCompile = template.tmpl(tplContent);
                }
                html = tplCompile(data, self.helper);
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
        appendToParent: function() {
            if (this.parentEl) {
                this.parentEl.appendChild(this.el);
            }
            return this;
        },
        /**
         * 是否有模板内容
         * @return {Boolean}
         */
        hasTplContent: function() {
            return !!this.tplContent;
        },
        /**
         * 获取组件在层级关系中的位置
         * @return {String} 生成结果index/recommend/app12
         */
        getAbsPath: function() {
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
        _allowToRender: function() {
            return !this.prevNode || this.prevNode.rendered;
        },
        /**
         * 初始化模板
         * tpl的取值: #a-tpl-id 或者 'tpl.file.name'
         * @private
         * @param  {Function} callback 回调
         */
        _initTemplate: function(callback) {
            var self = this,
                tpl = self.tpl,
                html;
            callback = callback || emptyFunc;
            //使用HTML文件中的<script type="template" id="{id}"></script>
            if (tpl && tpl.indexOf('#') === 0) {
                html = document.getElementById(tpl).innerHTML;
                if (html) {
                    self.tplContent = html;
                }
            }
            callback( !! self.tplContent);
        },
        /**
         * 初始化HTML元素
         * @private
         * @param  {Function} callback 回调函数
         */
        _initHTMLElement: function(callback) {
            var self = this,
                selector = self.selector,
                el;
            callback = callback || emptyFunc;
            //配置了选择器，直接使用选择器查询
            if (selector) {
                el = self.parentEl.querySelector(selector);
                callback(el);
            //没有则初始化模板
            } else {
                self._initTemplate(function(success) {
                    if (success) {
                        //如果模板初始化成功则渲染模板
                        el = createElement(self.tmpl())[0];
                    } else {
                        //没有初始化成功, 需要初始化一个页面的Element
                        el = document.createElement('section');
                    }
                    callback(el);
                });
            }
        },
        /**
         * 监听事件
         * @private
         * @param  {Object} listeners 事件配置
         */
        _listen: function(listeners) {
            function onListen(event, self) {
                return function() {
                    listeners[event].apply(self, slice.call(arguments, 0));
                };
            }
            if (!listeners) {
                return;
            }
            var evtArr = '',
                com,
                len;
            for (var evt in listeners) {
                if (listeners.hasOwnProperty(evt)) {
                    evtArr = evt.split(eventSpliter);
                    len = evtArr.length;
                    //TYPE:ID:Event
                    if (3 === len) {
                        com = this.getChildById(evtArr[1]);
                        if (!com) {
                            //假如这个时候组件还没有创建，则先记录下来，
                            //组件创建的时候再监听，详见:appendChild
                            this._deferListener(evtArr[0], evtArr[1], evtArr[2],
                                onListen(evt, this));
                        } else {
                            this.listenTo(com, evtArr[2], onListen(evt, this));
                        }
                        //Event
                    } else if (1 === len) {
                        //只有Event的时候表示监听自身
                        this.on(evt, onListen(evt, this));
                    } else {
                        throw new Error('Com:Wrong Event Formate[Type:ID:Event]: ' +
                            evt);
                    }
                }
            }
        },
        /**
         * 结束渲染
         * @private
         */
        _finishRender: function() {
            this.rendered = true; //标志已经渲染完毕
            this.trigger(AFTER_RENDER, this);
        },
        /**
         * 绑定UI事件
         * @private
         */
        _bindUIEvent: function() {
            if (!this.parentEl || this._uiEventBinded) {
                return this;
            }
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
                this._uiDelegate(eventType, elementSelector, callback);
            }
            this._uiEventBinded = true;
        },
        /**
         * _uiDelegate
         * 托管UI事件绑定
         * @private
         * @params {String} eventName 事件名称
         * @params {String} selector 选择器
         * @params {Function} fn 事件回调函数
         */
        _uiDelegate: function(eventName, selector, fn) {
            var self = this;
            var delegator = function(ev) {
                var target = ev.target,
                    evProxy;
                //定位被托管节点
                while (target && target !== this &&
                        !target[matchesSelector](selector)) {
                    target = target.parentNode;
                }
                ev.target = target;
                if (target && target !== this) {
                    evProxy = _.extend(createProxy(ev), {currentTarget: target});
                    return fn.apply(target,
                            [evProxy, self].concat(slice.call(arguments, 1)));
                }

            };
            this.parentEl.addEventListener(eventName, delegator, false);
        },
        /**
         * _delegate
         * 托管事件绑定
         * @private
         * @params {String} type 节点类型
         * @params {String} id   节点id
         * @params {String} eventType 事件类型
         * @params {Function} fn 事件回调函数
         */
        _deferListener: function(type, id, eventType, fn) {
            var eventObj,
                typeAndId = [type, id].join(eventSpliter);
            if (!(eventObj = this._notFinishListener[typeAndId])) {
                eventObj = this._notFinishListener[typeAndId] = {};
            }
            eventObj[eventType] = fn;
        },
        /**
         * 组件状态是否有改变
         * @private
         * @param  {Object}  newParams 组件的新状态
         * @return {Boolean}
         */
        _isStateChange: function(state) {
            return !_.isEqual(state, this.state);
        },
        /**
         * 创建子组件
         * @private
         */
        _buildComponents: function() {
            var self = this,
                comConstru = self._cpConstructors, //组件构造函数列表
                components = [],
                Component,
                cItm,
                cp = null;
            //构造子组件（sub Component）
            if (_.isArray(comConstru)) {
                var len = comConstru ? comConstru.length : 0;
                for (var i = 0; i < len; i++) {
                    cItm = comConstru[i];
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
                        parentNode: self,
                        env: this.env
                    }, cItm /*cItm为组件的配置*/ ));
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
    /*['show', 'hide', 'toggle', 'empty'].forEach(function(method) {
        DisplayComponent.prototype[method] = function() {
            var args = slice.call(arguments);
            this.$el[method].apply(this.$el, args);
            return this;
        };
    });*/
    return DisplayComponent;
}));
