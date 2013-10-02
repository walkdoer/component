/**
 * 组件类
 */
define(function (require, exports) {
    'use strict';
    var Display = require('base/display'),
        Page;

    Page = Display.extend({
        type: 'page',
        _components: [],
        /*** Function ***/
        render: function (data) {
            var cpConstructors = this.components,//组件构造函数列表
                components = this._components,
                Component,
                cp;
            //创建组件
            for (var i = 0, len = cpConstructors.length; i < len; i++) {
                Component = cpConstructors[i];
                cp = new Component({
                    parent: this.el
                });
                components.push(cp);
                cp.render(data[cp.name]);
            }
            this.el.appendTo(this.parent);
        }
    });


    return Page;
});