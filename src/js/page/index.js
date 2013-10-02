/**
 * [页面] 首页
 */
define(function (require, exports) {
    console.log(Date.now());
    'use strict';
    var Page = require('base/page'),
        Index;

    Index = Page.extend({
        tpl: 'page.index'
    });
    return Index;
});