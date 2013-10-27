/**
 * [页面] 帮助页面
 */
define(function (require, exports) {
    'use strict';
    var Page = require('base/page'),
        Component = require('base/component'),
        Button = require('component/button'),
        Footer = require('component/footer'),
        Help;
    Help = Page.extend({
        name: 'help',
        components: [{
            _constructor_: Component,
            option: {
                tpl: 'page.help',
                className: 'help',
                components: [{
                    _constructor_: Button,
                    option: {
                        name: 'back',
                        selector: '.back'
                    }
                }]
            }
        }, Footer],
        listeners: {
            'button:back:click': function () {
                history.back();
            }
        }
    });
    return Help;
});