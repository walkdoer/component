define(function(require, exports) {
    'use strict';
    var $ = require('core/selector'),
        router = require('core/router'),
        model = require('model'),
        pageClass = {},
        $body = $('body'),
        changePage;
    changePage = function (ctx, next) {
        var pathname = ctx.pathname,
            pageName = pathname.slice(1),
            pg;
        if (!pageClass[pageName]) {
            require.async('page/' + pageName, function (Page) {
                pageClass[pageName] = Page;
                pg = new Page({
                    parent: $body
                });
                pg.on('beforerender', function (evt, page) {
                    $body.empty();
                    console.debug('准备渲染页面' + page.name);
                }).on('afterrender', function (evt, page) {
                    console.debug('成功渲染页面' + page.name);
                });
                model.getData(pageName, function (data) {
                    pg.render(data);
                });
            });
        }
    };
    router('/index', changePage);
    router();
});