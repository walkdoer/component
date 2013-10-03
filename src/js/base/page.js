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
        var cp;
        for (var i = 0, len = components.length; i < len; i++) {
            cp = components[i];
            if (cp.name === targetCp.name && cp.num === targetCp.num) {
                //found
                return i;
            }
        }
        return -1;//not found
    }
    Page = Display.extend({
        type: 'page',
        _components: [],
        _componentsWaitToRender: [],
        _data: null,  //页面数据
        removeComponentFromWaitQueue: function (component) {
            var pos = getComponentPosition(this._componentsWaitToRender, component);
            if (pos >= 0) {
                this._componentsWaitToRender.splice(pos, 1);
                console.debug('将' + component.name + '移出待渲染序列', this._componentsWaitToRender.length);
            }
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
                        self._componentsWaitToRender.push(component);
                        return false;
                    }
                }).on('afterrender', function (event, component) {
                    console.debug('成功渲染组件:' + component.name);
                    //组件渲染成功后，移除自己在等待渲染队列的引用
                    self.removeComponentFromWaitQueue(component);
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
                cp.render(data[cp.name]);
            }
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