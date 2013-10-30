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
        _linkCmp: function (curCmp, prevCmp) {
            if (prevCmp) {
                prevCmp.nextNode = curCmp;
            }
            curCmp.prevNode = prevCmp;
        },
        /**
         * 添加子组件
         * @param {Display/Component/Array} components
         */
        addCmp: function (components) {
            var self = this,
                addList = $.isArray(components) ? components : [components],
                renderedList = this._components,
                waitList = this._componentsWaitToRender,
                prevCmp = waitList[waitList.length - 1] || renderedList[renderedList.length - 1];
            if (!components) { return; }
            //绑定组件渲染各个阶段的事件: BEFORE_RENDER：渲染前, AFTER_RENDER: 渲染后
            $.each(addList, function (i, comp) {
                //链接组件的关系
                self._linkCmp(comp, prevCmp);
                prevCmp = comp;
                comp.on('BEFORE_RENDER', function (event, component) {
                    //还没有轮到，插入等待序列
                    if (!self.allowToRender(component)) {
                        component.isContinueRender = false;
                    } else {
                        if (self._components.length === 0) {
                            self.trigger('BEFORE_RENDER_FIRST_COMPONENT', [self]);
                        }
                        // isContinueRender 表示执行下面的Render
                        component.isContinueRender = true;
                    }
                }).on('AFTER_RENDER', function (event, component) {
                    //console.debug('成功渲染组件:' + component.getType() + component.getName());
                    //组件渲染成功后，移除自己在等待渲染队列
                    console.log('pop up ' + component.type);
                    self._popWaitQueue();
                    self._components.push(component);
                    //如果渲染序列中没有等待渲染的元素，也就意味着页面渲染结束
                    if (!self.isAllComponentRendered()) {
                        //通知下一个组件渲染
                        self._componentsWaitToRender[0].render();
                    }
                });
            });
            this._componentsWaitToRender = this._componentsWaitToRender.concat(addList);
            return this;
        },
        /**
         * 查询该组件是否由其他组件组成
         * @return {Boolean}
         */
        hasComponent: function () {
            var cpCs = this._cpConstructors;
            return !!cpCs && cpCs.length > 0;
        },
        _buildComponents: function () {
            var self = this,
                cpConstructors = self._cpConstructors,//组件构造函数列表
                components = [],
                Component,
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
                        throw new UserError('compNotRight', this.getType() + ' Component\'s component config is not right');
                    }
                    //创建组件
                    cp = new Component($.extend({
                        parent: this.el,
                        params: this.params,
                        data: this.data,
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
        init: function (option) {
            //console.log('init ' + this.type);
            var self = this;
            self.startInit();
            self.initVariable(option, initVar);
            self._components = [];
            self._componentsWaitToRender = [];
            self._cpConstructors = self.components;
            self._super(option);
            //添加新建的子组件到组件中
            self.addCmp(self._buildComponents());
            self._bindUIEvent();
            self.finishInit();
            //console.log('finishInit ' + this.type);
        },
        allowToRender: function (component) {
            if (!component) {
                //Todo 这里考虑要不要throw Error呢？
                return false;
            }
            var pos = getComponentPosition(this._componentsWaitToRender, component);
            if (pos === 0) { //如果组件处于待渲染队列的队头
                return true;
            } else {
                return false;
            }
        },
        render: function () {
            //这里写成回调的原因：渲染组件默认模板成功之后再渲染子组件,
            //最后返回this
            var self = this;
            if (self._componentsWaitToRender.length > 0) {
                self._componentsWaitToRender[0].render();
            }
            this._super();
        }
    });
    return Component;
});