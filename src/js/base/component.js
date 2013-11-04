/**
 * 组件类
 */
define(function (require, exports) {
    'use strict';
    var $ = require('core/selector'),
        _ = require('core/lang'),
        Display = require('base/display'),
        Event = require('base/event'),
        initVar = ['name', 'components', 'params', 'data', 'queries', 'state'],
        Component;
    //添加事件
    Event.register('BEFORE_RENDER_FIRST_COMPONENT', 'before:render:firstcomponent');
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
        getParams: function (newState) {
            var self = this,
                newParams = {},
                state = self.state;
            if ($.isArray(state)) {
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
                    //组件还没有渲染
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
                    console.debug('成功渲染组件:' + component.getType() + component.getName());
                    //组件渲染成功后，移除自己在等待渲染队列
                    //console.log('pop up ' + component.type);
                    self._popWaitQueue();
                    self._components.push(component);
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
                        parent: this.el,
                        params: option.params,
                        queries: option.queries,
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
            self.params = self.getParams({
                params: self.params,
                queries: self.queries
            });
            self._components = [];
            self._componentsWaitToRender = [];
            self._cpConstructors = self.components;
            //初始化父类Display
            self._super(option, function () {
                //添加新建的子组件到组件中
                self.addCmp(self._buildComponents());
                self._bindUIEvent();
                self.finishInit();
            });
            //console.log('finishInit ' + this.type);
        },
        allowToRender: function (component) {
            if (!component) {
                //Todo 这里考虑要不要throw Error呢？
                return false;
            }
            if (this._componentsWaitToRender.length === 0) {
                return false;
            }
            //如果组件处于待渲染队列的队头
            if (isSameComponent(this._componentsWaitToRender[0], component)) {
                return true;
            } else {
                return false;
            }
        },
        render: function () {
            var self = this,
                fragment = document.createDocumentFragment(),
                firstcomponent = self._componentsWaitToRender[0],
                component = firstcomponent;
            //先渲染组件的子组件
            while (component) {
                if (!component.selector) {
                    if (component.type === 'app' || component.type === 'category') {
                        console.log(component.type);
                    }
                    fragment.appendChild(component.render().el);
                }
                component = component.nextNode;
            }
            if (firstcomponent) {
                firstcomponent.parent.appendChild(fragment);
            }
            //然后再渲染组件本身，这样子可以尽量减少浏览器的重绘
            return this._super();
        },
        update: function (state, data) {
            //更新组件的子组件
            var cmp = this._components[0];
            while (cmp) {
                //组件有状态，且状态改变，则需要更新，否则保持原样
                if (cmp.state && cmp.isStateChange(state) && cmp.rendered) {
                    console.debug('update ' + cmp.getType()  + ':' + cmp.getName());
                    cmp.update(state, data);
                }
                cmp = cmp.nextNode;
            }
        }
    });
    return Component;
});