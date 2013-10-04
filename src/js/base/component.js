/**
 * 组件类
 */
define(function (require, exports) {
    'use strict';
    var Display = require('base/display'),
        Component;
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
        return cpA.name === cpB.name && cpA.num === cpB.num;
    }
    Component = Display.extend({
        type: 'component',
        _components: null,
        _componentsWaitToRender: null,
        _data: null,  //页面数据
        removeFromWaitQueue: function (component) {
            var pos = getComponentPosition(this._componentsWaitToRender, component);
            if (pos >= 0) {
                this._componentsWaitToRender.splice(pos, 1);
                //console.debug('将' + component.getName() + '移出待渲染序列', this._componentsWaitToRender.length);
            }
        },
        isInWaitQueue: function (component) {
            var components = this._componentsWaitToRender;
            for (var i = 0; i < components.length; i++) {
                if (isSameComponent(components[i], component)) {
                    return true;
                }
            }
            return false;
        },
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
        hasComponent: function () {
            return this._components.length > 0;
        },
        getComponentPosition: function (component) {
            return getComponentPosition(this._components, component);
        },
        initVariable: function (option, variables) {
            this._components = [];
            this._componentsWaitToRender = [];
            this._super(option, variables);
        },
        init: function (option) {
            this.startInit();
            this.initVariable(option, ['name']);
            this._super(option, true);
            var cpConstructors = this.components,//组件构造函数列表
                components = this._components,
                self = this,
                Component,
                cp;
            //构造子组件（sub Component）
            for (var i = 0, len = cpConstructors ? cpConstructors.length : 0; i < len; i++) {
                Component = cpConstructors[i];
                //创建组件
                cp = new Component({
                    parent: this.el
                });
                cp.on('beforerender', function (event, component) {
                    //还没有轮到，插入等待序列
                    if (!self.allowToRender(component)) {
                        console.debug(component.getName() + '还不能渲染');
                        //组件不再等待渲染的序列中，就插入到等待序列
                        if (!self.isInWaitQueue(component)) {
                            self._componentsWaitToRender.push(component);
                            component.isContinueRender = false;
                        } else {
                            //console.debug('组件' + component.getName() + '已经在渲染序列中');
                        }
                    } else {
                        if (self.getComponentPosition(component) === 0) {
                            self.trigger('beforerenderfirstcomponent', [self]);
                            if (!self.rendered) {
                                self.el.appendTo(self.parent);
                            }
                        }
                        component.isContinueRender = true;
                    }
                }).on('afterrender', function (event, component) {
                    console.debug('成功渲染组件:' + component.getName());
                    //组件渲染成功后，移除自己在等待渲染队列的引用
                    self.removeFromWaitQueue(component);
                    //判断是否渲染结束
                    if (!self.isAllComponentRendered()) {
                        //渲染等待序列中的其他组件
                        self.renderComponents(self._componentsWaitToRender, self._data);
                    } else {
                        //如果渲染序列中没有等待渲染的元素，也就意味着页面渲染结束
                        self.finishRender();
                    }
                });
                components.push(cp);
            }
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
        renderComponents: function (components, data) {
            var cp;
            for (var i = 0, len = components.length; i < len; i++) {
                cp = components[i];
                if (cp) {
                    cp.render(data[cp.name]);
                }
            }
        },
        render: function (data) {
            //this._data = data;
            //这里写成回调的原因：渲染组件默认模板成功之后再渲染子组件
            this._super(data, (function (component) {
                //如果有组件再进行渲染，没有则返回undefined
                if (component.hasComponent()) {
                    return function (component, data) {
                        //渲染该组件的子组件
                        component.renderComponents(component._components, data);
                        //将元素添加到父元素
                        //component.el.appendTo(component.parent);
                    };
                }
            })(this));
        }
    });


    return Component;
});