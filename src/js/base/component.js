/**
 * 显示类
 */
define(function (require, exports) {
    'use strict';
    var Class = require('lib/class'),
        serialNumberGenerator = require('base/serialNumberGenerator'),
        Component;
    Component = Class.extend({
        type: 'component',
        updating: false,  //更新中
        initializing: false,  //初始化进行中
        initialized: false,  //已初始化
        /**
         * 组件构造函数, 组件的初始化操作
         * @param  {Object} option 组件配置
         *
         */
        init: function (option) {
            var self = this;
            //为每一个组件组件实例赋予一个独立的sn
            self.sn = serialNumberGenerator.gen();
            //创建默认的ID，ID格式:{type}-{sn}
            self.id = [self.getType(), self._num].join('-');
            self.childNodes = [];
        },
        /**
         * 删除节点
         */
        destroy: function () {
            if (this.prevNode) {
                this.prevNode.nextNode = this.nextNode;
            }
            if (this.nextNode) {
                this.nextNode.prevNode = this.prevNode;
            }
        },
        /**
         * 将组件连接起来
         *
         *     prevNode -> curNode -> nextNode
         *
         * @param  {[type]} curCmp  [description]
         * @param  {[type]} prevCmp [description]
         * @return {[type]}         [description]
         */
        _linkCmp: function (prevCompnentNode, nextComponentNode) {
            if (prevCompnentNode) {
                this.prevNode = prevCompnentNode;
                prevCompnentNode.nextNode = this;
            }
            if (nextComponentNode) {
                this.nextNode = nextComponentNode;
                nextComponentNode.preNode = this;
            }
        },
        /**
         * 初始化组件的变量列表
         * @param  {Array} variableArray 需要初始化的变量名数组 
         *
         *         变量名格式: {配置项属性名称}[:{组件属性名称}]
         *
         *         如果组件的初始化配置option是:
         *         {
         *             name: 'hello',
         *             parent: this,
         *             identity: 'this/is/a/identity'
         *         }
         *         如果组件类定义了3个属性, name对应option.name,  p 对于option.parent, id对应option.identity
         *         那么应该传入的参数就是：['name', 'parent:p', 'identity:id']
         *
         * @return
         */
        initVar: function (variableArray) {
            var component = this,
                option = component.originalOption;
            variableArray.forEach(function (element) {
                var variableConfigArray = element.split(':'),
                    optionKey = variableConfigArray[0],
                    variableName = variableConfigArray[1] || optionKey;
                if (option[optionKey] !== undefined) {
                    component[variableName] = option[optionKey];
                }
            });
        },
        /**
         * 根据Id查找组件
         * @param  {String} id 组件编号
         * @return {Component/Null} 返回组件,找不到则返回Null
         */
        getCmp: function (id) {
            var childNodes = this.childNodes,
                node = childNodes[0];
            while (node) {
                if (node.id === id) {
                    return node;
                }
                node = node.nextNode;
            }
            return null;
        }
    });
    return Component;
});