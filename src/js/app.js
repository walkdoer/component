define(function(require, exports) {
    'use strict';
    var router = require('core/router'),
        model = require('model'),
        view = require('view'),
        changePage,
        getData;

    getData = function (ctx, next) {
        var pathname = ctx.pathname,
            pageName = pathname.slice(1);
        model.getData(pageName, function (data) {
            ctx.data = data;
            ctx.pageName = pageName;
            next();
        });
    };

    changePage = function (ctx, next) {
        view.changePage(ctx.pageName, ctx.data);
        next();
    };

    router('/index', getData, changePage);
    router('/help', getData, changePage);
    router();
});