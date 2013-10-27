define(function(require, exports) {
    'use strict';
    var router = require('core/router'),
        Component = require('base/component'),
        model = require('model'),
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

    var App = Component.extend({
        type: 'application',
        _pages: null,
        init: function (option) {
            this.startInit();
            this._super(option, true);
            this._initVariable(option, ['beforeLoad']);
            this.pagesOption = this.originOption.pages;
            this._router();
            this.finishInit();
        },
        /**
         * 根据用户配置的PageOption进行Router绑定
         */
        _router: function () {
            var self = this;
            $.each(this.pagesOption, function (pageName) {
                router(['/', pageName].join(''), getData, function (ctx) {
                    self.changePage(ctx.pageName, ctx.data);
                });
            });
            router();
        },
        /**
         * 切换页面
         */
        changePage: function (pageName, data) {
            //如果页面已经建立就直接显示页面
            if (this.isPageCreated(pageName)) {
                this.getPage(pageName).show();
            } else {
                //页面没有建立，创建页面
                this._createPage(pageName, function (page) {
                    page.render(data);
                });
            }
        },
        _getOption: function (pageName) {
            return this._pagesOption[pageName] || null;
        },
        _createPage: function (pageName, callback) {
            var self = this,
                pageOption = this._getOption(pageName);
            //读取类文件
            require.async('page/' + pageName, function (PageClass) {
                //创建类
                var pg = new PageClass(pageOption);
                this.pages = pg;
                pg.on('BEFORE_RENDER', function (evt, page) {
                    //如果要加载的页面没有页面模板，则不清空Body
                    if (page.hasTplContent && self.firstInitial) {
                        $(self.beforeLoad).empty();
                    }
                    console.debug('准备渲染页面' + page.getName());
                }).on('AFTER_RENDER', function (evt, page) {
                    console.debug('成功渲染页面' + page.getName());
                }).on('BEFORE_RENDER_FIRST_COMPONENT', function (evt, page) {
                    //如果渲染第一个组件的时候，这个页面是没有加载成功的,hasTplContent = false
                    //这个时候body是没有清空的,需要清空body
                    if (!page.hasTplContent()) {
                        if (self.firstInitial && self.beforeLoad) {
                            //加载中提示...
                            $(self.beforeLoad).remove();
                        }
                        page.empty();
                        //取消第一次初始化的标志
                    } else {
                        page.empty();
                    }
                    console.log('渲染第一个组件' + page.getName());
                }).on('RENDERED', function (evt, page) {
                    console.debug('渲染页面' + page.getName() + '结束');
                    self.firstInitial = false;
                });
                if (typeof callback === 'function') {
                    callback(pg);
                }
            });
        }
    });
    return App;
});