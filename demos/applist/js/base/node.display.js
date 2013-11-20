/**
 * 显示类
 * @extend Component{base/Component}
 */
define(function (require, exports) {
    'use strict';
    var $ = require('selector'),
        Component = require('base/node'),
        emptyFunc = function () {},
        DisplayComponent;
    DisplayComponent = Component.extend({
        type: 'display',
        /*------- Status --------*/
        tplDowloading: false, //下载模板中
        rendered: false,  //已渲染
        /*-------- Flag ---------*/
        display: true, //是否显示组件
        init: function (option) {
            var self = this;
            self._super(option);
            self.initVar([
                'tpl',
                'tplContent', 
                'parentEl',
                'className',
                'display',
                'el',
                'selector'
            ]);
            //初始化组件HTML元素
            self._initElement(function () {
                self.$el.attr('id', self.id)
                        .attr('class', self.className);
                //监听组件原生listener
                self._listen(self.listeners);
                //用户创建的Listener
                self._listen(option.listeners);
            });
        },
        _initTemplate: function (callback) {
            var self = this,
                tpl = self.tpl;
            callback = callback || emptyFunc;
            //使用HTML文件中的<script type="template" id="{id}"></script>
            if (tpl && tpl.indexOf('#') === 0) {
                self.tplContent = $(tpl).html();
                callback(true);
            } else if (tpl) {
                //tpl配置是文件，异步加载文件
                require.async('tpl/' + tpl, function (res) {
                    if (res) {
                        self.tplContent = res;
                        callback(true);
                    } else {
                        callback(false);
                    }
                });
            } else {
                //没有配置模板，输出提示
                console.warn(['Has no template(tpl) or element(el) config for',
                    '[', self.getType() || '[unknow type]', ']',
                    '[', self.id || '[unknow name]', ']',
                    'please check your option'].join(' '));
            }
        },
        _initElement: function (callback) {
            var self = this,
                selector = self.selector;
            callback = callback || emptyFunc;
            if (self.el) {
                callback();
            } else if (selector) {
                self.$el = self.$parentEl.find(selector);
                self.el = self.$el[0];
            } else {
                self._initTemplate(function (success) {
                    if (success) {
                        self.$el = $(self.tmpl());
                        self.el = self.$el[0];
                    } else {
                        //没有初始化成功, 需要初始化一个页面的Element
                        self.el = document.createElement('section');
                        self.$el = $(self.el);
                    }
                    callback();
                });
            }
        }
    });
    return DisplayComponent;
});