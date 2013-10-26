define(function(require, exports) {
    'use strict';
    var $ = require('core/selector'),
        Page = require('base/page'),
        firstInitial = true,
        $body = $('body'),
        pages = {},
        pageClass = {
            help: Page
        },
        changePage,
        getPrevPage,
        buildPage,
        prevPageName,
        viewOption;

    changePage = function (pageName, params, data) {
        var prevPage = getPrevPage(prevPageName),
            pg = pages[pageName];
        if (prevPage) {
            //有上一页则将之隐藏
            prevPage.hide();
        }
        //页面没有创建过
        if (!pg) {
            //使用回调的原因是这个过程可能是异步的，因为定义页面代码可能需要远程加载
            buildPage(pageName, params, function (page) {
                pg = page;
                pg.render(data);
            });
        } else {
            //页面已经创建，直接显示
            pg.show();
        }
        prevPageName = pageName;
    };
    buildPage = function (pageName, params, callback) {
        var PageClass = pageClass[pageName],
            createPage = function (pageName, params, PageClass) {
                var pg;
                //构建页面
                pg = pages[pageName] = new PageClass({
                    name: pageName,
                    params: params,
                    parent: $body
                });
                pg.on('BEFORE_RENDER', function (evt, page) {
                    //如果要加载的页面没有页面模板，则不清空Body
                    if (page.hasTplContent && firstInitial) {
                        $(viewOption.beforeLoad).empty();
                    }
                    console.debug('准备渲染页面' + page.getName());
                }).on('AFTER_RENDER', function (evt, page) {
                    console.debug('成功渲染页面' + page.getName());
                }).on('BEFORE_RENDER_FIRST_COMPONENT', function (evt, page) {
                    //如果渲染第一个组件的时候，这个页面是没有加载成功的,hasTplContent = false
                    //这个时候body是没有清空的,需要清空body
                    if (!page.hasTplContent()) {
                        if (firstInitial && viewOption.beforeLoad) {
                            //加载中提示...
                            $(viewOption.beforeLoad).remove();
                        }
                        page.empty();
                        //取消第一次初始化的标志
                    } else {
                        page.empty();
                    }
                    console.log('渲染第一个组件' + page.getName());
                }).on('RENDERED', function (evt, page) {
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
                    callback(createPage(pageName, params, PageClass));
                }
            });
        } else {
            //已有构建函数，同步
            if (typeof callback === 'function') {
                callback(createPage(pageName, params, PageClass));
            }
        }
    };
    getPrevPage = function () {
        return pages[prevPageName];
    };
    exports.changePage = changePage;
    exports.init = function (option) {
        viewOption = option;
    };
});