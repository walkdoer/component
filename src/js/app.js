define(function(require, exports) {
    'use strict';
    var router = require('core/router'),
        model = require('model'),
        view = require('view'),
        changePage,
        getData;
        //outPutAppStatus,
        //outPutPageStatus;
    /*outPutAppStatus = function () {
        for (var pgName in pages) {
            if (pages.hasOwnProperty(pgName)) {
                var pg = pages[pgName];
                console.debug(pg.type + pg.name + ' rendered: ' + pg.rendered);
                outPutPageStatus(pg);
            }
        }
    };
    outPutPageStatus = function (pg) {
        var components = pg._components,
            cp;
        for (var i = 0; i < components.length; i++) {
            cp = components[i];
            console.debug('|____' + cp.type + cp.name + ' rendered: ' + cp.rendered);
        }
    };*/

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