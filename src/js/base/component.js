/**
 * 组件类
 */
define(function (require, exports) {
    'use strict';
    var Display = require('base/display'),
        tpl = require('core/template'),
        Component;

    Component = Display.extend({
        tpl: null,
        tplContent: null,
        /*** Flag ***/
        updating: false,  //更新中
        rendered: false,  //已渲染

        /*** Function ***/
        init: function init(option) {
            this._super(option);
            this.tpl = option.tpl;
            this.tplContent = require('tpl/' + this.tpl);
        },
        /**
         * 渲染组件
         */
        render: function render(data) {
            this.container.append(this.tmpl(data));
            this.rendered = true;
        },
        update: function () {
            this.updating = true;
        },
        tmpl: function template(data) {
            var tplCont = this.tplContent,
                html;
            if (tplCont) {
                html = tpl.tmpl(tplCont, data, this.helper);
            }
            return html || '';
        }
    });


    return Component;
});