define(function(require, exports) {
    'use strict';
    var $ = require('core/selector'),
        Page = require('base/page'),
        changePage,
        getPrevPage,
        buildPage,
        pages = {},
        firstInitial = true,
        prevPageName,
        $body = $('body'),
        pageClass = {
            help: Page
        };

    changePage = function (pageName, data) {
        var prevPage = getPrevPage(prevPageName),
            pg = pages[pageName];
        if (prevPage) {
            //有上一页则将之隐藏
            prevPage.hide();
        }
        //页面没有创建过
        if (!pg) {
            //使用回调的原因是这个过程可能是异步的，因为定义页面代码可能需要远程加载
            buildPage(pageName, function (page) {
                pg = page;
                pg.render(data);
            });
        } else {
            //页面已经创建，直接显示
            pg.show();
        }
        prevPageName = pageName;
    };
    buildPage = function (pageName, callback) {
        var PageClass = pageClass[pageName],
            createPage = function (pageName, PageClass) {
                var pg;
                //构建页面
                pg = pages[pageName] = new PageClass({
                    name: pageName,
                    tpl: ['page', pageName].join('.'),
                    parent: $body
                });
                pg.on('beforerender', function (evt, page) {
                    //如果要加载的页面没有页面模板，则不清空Body
                    if (page.hasTplContent && firstInitial) {
                        $body.empty();
                    }
                    console.debug('准备渲染页面' + page.getName());
                }).on('afterrender', function (evt, page) {
                    console.debug('成功渲染页面' + page.getName());
                }).on('beforerenderfirstcomponent', function (evt, page) {
                    //如果渲染第一个组件的时候，这个页面是没有加载成功的,hasTplContent = false
                    //这个时候body是没有清空的,需要清空body
                    if (!page.hasTplContent()) {
                        if (firstInitial) {
                            $body.empty();
                        }
                        page.empty();
                        //取消第一次初始化的标志
                    } else {
                        page.empty();
                    }
                    console.log('渲染第一个组件' + page.getName());
                }).on('pagerendered', function (evt, page) {
                    console.debug('渲染页面' + page.getName() + '结束');
                    firstInitial = false;
                });
                return pg;
            };
        //没有构建函数
        if (!PageClass) {
            //异步加载组件代码
            require.async('page/' + pageName, function (PageClass) {
                pageClass[pageName] = PageClass;
                if (typeof callback === 'function') {
                    callback(createPage(pageName, PageClass));
                }
            });
        } else {
            //已有构建函数，同步
            if (typeof callback === 'function') {
                callback(createPage(pageName, PageClass));
            }
        }
    };
    getPrevPage = function () {
        return pages[prevPageName];
    };
    exports.changePage = changePage;
});