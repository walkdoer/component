/**
 * [组件] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/node.display'),
        Button = require('component/button'),
        Menu = require('component/menu'),
        Navigator;

    Navigator = Component.extend({
        type: 'navigator',
        tpl: 'com.navigator',
        components: [{
            _constructor_: Button,
            option: {
                name: 'cate',
                className: 'btn-cate',
                title: '栏目'
            }
        }, {
            _constructor_: Menu,
            option: {
                id: 'nav-menu',
                className: 'menu'
            }
        }],
        listeners: {
            'button:cate:click': function () {
                var menu = this.getCmp('nav-menu');
                menu.toggle();
            },
            'menu:click': function (a, b, c) {
                console.log(a, b, c);
            },
        }
    });
    return Navigator;
});