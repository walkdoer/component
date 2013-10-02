define(function(require, exports) {
    'use strict';
    var $ = require('core/selector'),
        router = require('core/router'),
        pageClass = {},
        pages = {},
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
                    container: $body
                });
                console.log(ctx, pageClass);
                pg.render();
            });
        }
    };
    router('/index', changePage);
    router();
});