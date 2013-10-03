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
                model.getData(pageName, function (data) {
                    pg.render(data);
                });
            });
        }
    };
    router('/index', changePage);
    router();
});