/**
 * 节点类
 */
define([
    './lang',
    './class',
    './var/idGen'
], function(_, Class, idGen) {
    'use strict';
    var R_CLONING = /^\*(.*)\*$/,
        Node;

    function getter(propName) {
        return function() {
            return this[propName];
        };
    }
    var eventSplitter = /\s+/;
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
            if (!this.firstChild) {
                this.firstChild = this.lastChild = node;
            } else {
                node._linkNode({
                    prev: this.lastChild
                });
                this.lastChild = node;
            }
            this.nodeCount++;
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
            if (!callback || !eventsApi(this, 'on', name, [callback, context])) {
                return this;
            }
            this._events || (this._events = {});
            var events = this._events[name] || (this._events[name] = []);
            events.push({callback: callback, context: context, ctx: context || this});
        },
        /**
         * off
         * 解绑函数，解除事件绑定
         * this.off()表示解绑所有事件
         * this.off(null, callback) 表示解绑事件回调函数为callback的所有事件
         * this.off('click', callback) 表示解绑回调函数为callback的事件回调
         * this.off('click', callback, context) 解绑上下文为context，回调函数为callback的事件监听函数
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
                        for(var j = 0, evt, eventsLen = events.length; j < eventsLen; j++) {
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
    });
    return Node;
});
