/**
 * 组件类
 */
define(function (require, exports) {
    'use strict';
    var Display = require('base/display'),
        tpl = require('core/template'),
        Page;

    Page = Display.extend({
        tpl: null,
        tplContent: null,
        /*** Flag ***/
        updating: false,  //更新中
        rendered: false,  //已渲染
        waitToRender: false,

        /*** Function ***/
        init: function init(option) {
            var self = this;
            this._super(option);
            this.initialized = false;
            this.initializing = true;
            if (option.tpl) {
                this.tpl = option.tpl;
            }
            require.async('tpl/' + this.tpl, function (res) {
                self.tplContent = res;
                self.initializing = false;
                self.initialized = true;
                if (self.waitToRender) {
                    self.render();
                    self.waitToRender = false;
                }
            });
        },
        /**
         * 渲染组件
         */
        render: function render(data) {
            if (this.initializing) {
                this.waitToRender = true;
            } else if (this.initialized) {
                this.container.append(this.tmpl(data));
                this.rendered = true;
            }
            return this;
        },
        update: function () {
            this.updating = true;
            return this;
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


    return Page;
});