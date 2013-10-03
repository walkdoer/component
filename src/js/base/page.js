/**
 * 组件类
 */
define(function (require, exports) {
    'use strict';
    var Display = require('base/display'),
        Page;
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
    function isSameComponent(cpA, cpB) {
        return cpA.name === cpB.name && cpA.num === cpB.num;
    }
    Page = Display.extend({
        type: 'page',
        _components: [],
        _componentsWaitToRender: [],
        _data: null,  //页面数据
        removeFromWaitQueue: function (component) {
            var pos = getComponentPosition(this._componentsWaitToRender, component);
            if (pos >= 0) {
                this._componentsWaitToRender.splice(pos, 1);
                console.debug('将' + component.name + '移出待渲染序列', this._componentsWaitToRender.length);
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
        getComponentPosition: function (component) {
            return getComponentPosition(this._components, component);
        },
        init: function (option) {
            var cpConstructors = this.components,//组件构造函数列表
                components = this._components,
                self = this,
                Component,
                cp;
            this._super(option);
            this.startInit();
            for (var i = 0, len = cpConstructors.length; i < len; i++) {
                Component = cpConstructors[i];
                //创建组件
                cp = new Component({
                    parent: this.el
                });
                cp.on('beforerender', function (event, component) {
                    //还没有轮到，插入等待序列
                    if (!self.allowToRender(component)) {
                        console.debug(component.name + '还不能渲染');
                        //组件不再等待渲染的序列中，就插入到等待序列
                        if (!self.isInWaitQueue(component)) {
                            self._componentsWaitToRender.push(component);
                            component.isContinueRender = false;
                        } else {
                            console.debug('组件' + component.name + '已经在渲染序列中');
                        }
                    } else {
                        component.isContinueRender = true;
                    }
                }).on('afterrender', function (event, component) {
                    console.debug('成功渲染组件:' + component.name);
                    //组件渲染成功后，移除自己在等待渲染队列的引用
                    self.removeFromWaitQueue(component);
                    //渲染等待序列中的其他组件
                    self.renderComponents(self._componentsWaitToRender, self._data);
                });
                components.push(cp);
            }
            this.finishInit();
        },
        allowToRender: function (component) {
            var components = this._components,
                pos = this.getComponentPosition(component);
            if (pos < 0) {
                return false;
            } else if (pos === 0) {
                return true;
            } else {
                if (components[pos - 1].rendered) {
                    console.log('前面的组件' + components[pos - 1].name + '已经渲染好了，当前组件 ' +
                        component.name + '可以渲染');
                    //如果当前组件的前一个已经渲染，当前可以进行渲染
                    return true;
                } else {
                    return false;
                }
            }
        },
        renderComponents: function (components, data) {
            var cp, log = '';
            for (var i = 0, len = components.length; i < len; i++) {
                cp = components[i];
                if (cp) {
                    log += ' ' + cp.name;
                    cp.render(data[cp.name]);
                }
            }
            console.debug(log);
        },
        /*** Function ***/
        render: function (data) {
            this._data = data;
            this.renderComponents(this._components, data);
            //将页面添加到父元素，一般是Body
            this.el.appendTo(this.parent);
        }
    });


    return Page;
});