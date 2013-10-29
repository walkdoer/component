/**
 * 组件类
 */
define(function (require, exports) {
    'use strict';
    var $ = require('core/selector'),
        Display = require('base/display'),
        Event = require('base/event'),
        UserError = require('base/userError'),
        initVar = ['name', 'components', 'params', 'data'],
        Component;
    //添加事件
    Event.add('BEFORE_RENDER_FIRST_COMPONENT', 'beforerenderfirstcomponent');
    /**
     * 获取组件在组件列表中的序号
     * @param  {Array} components     [组件数组]
     * @param  {Component} cp         [组件]
     * @return {Int}                  [序号 从0开始]
     */
    function getComponentPosition(components, targetCp) {
        for (var i = 0, len = components.length; i < len; i++) {
            if (isSameComponent(components[i], targetCp)) {
                //found
                return i;
            }
        }
        return -1;//not found
    }
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

    Component = Display.extend({
        type: 'component', //组件类型
        _components: null, //组件实例数组
        _componentsWaitToRender: null, //等待渲染序列
        data: null,  //页面数据
        nextNode: null,  //下一个组件
        prevNode: null,  //上一个组件
        removeFromWaitQueue: function (component) {
            var pos = getComponentPosition(this._componentsWaitToRender, component);
            if (pos >= 0) {
                this._componentsWaitToRender.splice(pos, 1);
                //console.debug('将' + component.getName() + '移出待渲染序列', this._componentsWaitToRender.length);
            }
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
            var components = this._components;
            for (var i = 0; i < components.length; i++) {
                if (!components[i].rendered) {
                    return false;
                }
            }
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
                tmp;
            if (!evts) {
                return;
            }
            for (var evt in evts) {
                tmp = evt.split(' ');
                eventType = tmp[0];
                elementSelector = tmp[1];
                callback =  evts[evt];
                this.on(eventType, elementSelector, (function (callback, context) {
                    return function () {
                        callback.apply(context, arguments);
                    };
                })(callback, this));
            }
        },
        getCmp : function (id) {
            var components = this._components,
                itm;
            for (var i = 0, len = components.length; i < len; i++) {
                itm = components[i];
                if (id === itm.id) {
                    return itm;
                }
            }
            return null;
        },
        hasComponent: function () {
            return !!this._cpConstructors && this._cpConstructors.length > 0;
        },
        getComponentPosition: function (component) {
            return getComponentPosition(this._components, component);
        },
        _buildComponents: function () {
            var cpConstructors = this._cpConstructors,//组件构造函数列表
                components = this._components,
                self = this,
                Component,
                cItm,
                prevCp = null,
                cp = null;
            //构造子组件（sub Component）
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
                    throw new UserError('compNotRight', this.getType() + ' Component\'s component config is not right');
                }
                prevCp = cp;
                //创建组件
                cp = new Component($.extend({
                    parent: this.el,
                    params: this.params,
                    data: this.data,
                    render: false,
                    listeners: {
                        'BEFORE_RENDER': function (event, component) {
                            //还没有轮到，插入等待序列
                            if (!self.allowToRender(component)) {
                                //console.debug(component.getType() + component.getName() + '还不能渲染');
                                //组件不在等待渲染的序列中，就插入到等待序列
                                if (!self.isInWaitQueue(component)) {
                                    self._componentsWaitToRender.push(component);
                                    // isContinueRender 表示不会执行下面的Render
                                    component.isContinueRender = false;
                                } else {
                                    //console.debug('组件' + component.getName() + '已经在渲染序列中');
                                }
                            } else {
                                if (self.getComponentPosition(component) === 0) {
                                    self.trigger('BEFORE_RENDER_FIRST_COMPONENT', [self]);
                                }
                                // isContinueRender 表示执行下面的Render
                                component.isContinueRender = true;
                            }
                        },
                        'AFTER_RENDER': function (event, component) {
                            //console.debug('成功渲染组件:' + component.getType() + component.getName());
                            //组件渲染成功后，移除自己在等待渲染队列的引用
                            self.removeFromWaitQueue(component);
                            //判断是否渲染结束
                            if (!self.isAllComponentRendered()) {
                                //渲染等待序列中的其他组件
                                $.each(self._componentsWaitToRender, function (i, component) {
                                    component.render();
                                });
                            } else {
                                //如果渲染序列中没有等待渲染的元素，也就意味着页面渲染结束
                                self.finishRender();
                            }
                        }
                    }
                }, cItm.option/*cItm.option为组件的配置*/));
                cp.prevNode = prevCp;
                if (prevCp) {
                    prevCp.nextNode = cp;
                }
                components.push(cp);
            }
            $.each(components, function (i, cp) {
                cp.render();
            });
        },
        init: function (option) {
            this.startInit();
            this.initVariable(option, initVar);
            this._components = [];
            this._componentsWaitToRender = [];
            //$.extend(this.listeners || (this.listeners = {}), option.listeners);
            this._cpConstructors = this.components;
            this._super(option, true);
            this._bindUIEvent();
            this.finishInit();
        },
        allowToRender: function (component) {
            var components = this._components,
                pos = this.getComponentPosition(component);
            if (!component) {
                return false;
            }
            if (pos < 0) {
                return false;
            } else if (pos === 0) {
                return true;
            } else {
                if (components[pos - 1].rendered) {
                    //console.log('前面的组件' + components[pos - 1].name + '已经渲染好了，当前组件 ' +
                    //    component.getName() + '可以渲染');
                    //如果当前组件的前一个已经渲染，当前可以进行渲染
                    return true;
                } else {
                    return false;
                }
            }
        },
        render: function () {
            //这里写成回调的原因：渲染组件默认模板成功之后再渲染子组件
            this._super(/*注意这里是一个自执行函数*/(function (component) {
                //如果有组件再进行渲染，没有则返回undefined
                if (component.hasComponent()) {
                    return function (component) {
                        //渲染该组件的子组件
                        component._buildComponents();
                    };
                }
            })(this));
        }
    });
    return Component;
});