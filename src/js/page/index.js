/**
 * [页面] 首页
 */
define(function (require, exports) {
    'use strict';
    var Page = require('base/page'),
        List = require('component/list'),
        Navigator = require('component/navigator'),
        Footer = require('component/footer'),
        Index;

    Index = Page.extend({
        name: 'index',
        tpl: 'page.index',
        components: [Navigator, List, Footer]
    });
    return Index;
});