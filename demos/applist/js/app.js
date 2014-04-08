/**
 * Application 应用类
 * @author zhangmhao@gmail.com
 */
define(function(require, exports) {
    'use strict';
    var $ = require('core/selector'),
        router = require('core/router'),
        Com = require('lib/com.js'),
        Application = require('components/application'),
        util = require('util'),
        model = require('model');

    Com.config({
        extend: $
    });
    exports.init = function (option) {
        var pages = option.pages;
        //初始化数据层
        model.init(option.api, option.jsonp, option.simulator);
        //初始化工具
        util.init(option.api.addUrl);
        //建立Application实例
        var app = new Application({
            name: option.name,
            parentEl: option.parent,
            beforeLoad: option.beforeLoad, //加载中提示
        });
        //监听页面路由配置
        $.each(pages, function (path) {
            router(path, function (ctx) {
                var pathname = ctx.pathname,
                    pageName = pathname.split('/')[1];
                //切换页面
                app.changePage(pageName,
                    {params: ctx.params, queries: ctx.queries}, pages[pageName]);
            });
        });
        //输入不存在的路由则将用户引导到首页
        router('*', function () {
            router.route(option.defaultRoute);
        });
        //启动路由监听
        router();
    };

});
