/**
 * Application 应用类
 * @author zhangmhao@gmail.com
 */
define(function(require, exports) {
    'use strict';
    var router = require('core/router'),
        Component = require('base/component'),
        model = require('model'),
        getData;

    getData = function (ctx, next) {
        var pathname = ctx.pathname,
            pageName = pathname.split('/')[1];
        model.get(pathname, {}, function success(data) {
            ctx.data = data;
            ctx.pageName = pageName;
            next();
        }, function error() {

        });
    };

    var App = Component.extend({
        type: 'application',
        _pages: null,
        _firstInitial: true,
        init: function (option) {
            this.startInit();
            this._super(option, true);
            this.initVariable(option, ['beforeLoad']);
            this._pagesOption = this.originOption.pages;
            this.pages = {};
            model.init(option.api);
            this._router();
            this._globalListen();
            this.finishInit();
        },
        _globalListen: function () {
            this.on('click', '.route', function (e) {
                var url = e.target.dataset.url;
                router.route(url);
            });
        },
        /**
         * 根据用户配置的PageOption进行Router绑定
         */
        _router: function () {
            var self = this;
            $.each(this._pagesOption, function (path) {
                router(path, getData, function (ctx) {
                    self.changePage(ctx.pageName, ctx.params, ctx.data);
                });
            });
            router();
        },
        /**
         * 切换页面
         */
        changePage: function (pageName, params, data) {
            var curPg = this.getPage(this.currentPage);
            //当前页面与要切换的页面相同，不需要切换
            if (curPg && curPg.getName() === pageName) {
                this.update(params, data);
                return;
            }
            //隐藏当前页
            if (curPg) {
                curPg.hide();
            }
            //如果页面已经建立就直接显示页面
            if (this.isPageCreated(pageName)) {
                this.getPage(pageName).show();
                this.currentPage = pageName;
            } else {
                //页面没有建立，创建页面
                this._createPage(pageName, params, data);
            }
        },
        getPage: function (pageName) {
            return this.pages[pageName];
        },
        isPageCreated: function (pageName) {
            return !!this.pages[pageName];
        },
        _getOption: function (pageName) {
            return this._pagesOption[pageName] || null;
        },
        _createPage: function (pageName, params, data, callback) {
            var self = this,
                pageOption = this._getOption(pageName);
            //读取类文件
            require.async('page/' + pageName, function (PageClass) {
                //创建类
                var defaultOption = {
                    parent: self.el,
                    data: data,
                    params: params,
                    listeners: {
                        'BEFORE_RENDER': function (evt, page) {
                            //如果要加载的页面没有页面模板，则不清空Body
                            if (page.hasTplContent() && self._firstInitial) {
                                $(self.beforeLoad).hide();
                            }
                            //console.debug('准备渲染页面' + page.getName());
                        },
                        'AFTER_RENDER': function (evt, page) {
                            //console.debug('成功渲染页面' + page.getName());
                        },
                        'BEFORE_RENDER_FIRST_COMPONENT': function (evt, page) {
                            //如果渲染第一个组件的时候，这个页面是没有加载成功的,hasTplContent = false
                            //这个时候body是没有清空的,需要清空body
                            if (!page.hasTplContent()) {
                                if (self._firstInitial && self.beforeLoad) {
                                    //加载中提示...
                                    $(self.beforeLoad).hide();
                                }
                                page.empty();
                                //取消第一次初始化的标志
                            } else {
                                page.empty();
                            }
                            //console.log('渲染第一个组件' + page.getName());
                        },
                        'RENDERED': function (evt, page) {
                            //console.debug('渲染页面' + page.getName() + '结束');
                            self._firstInitial = false;
                        }
                    }
                };
                pageOption = $.extend({}, defaultOption, pageOption);
                var pg = new PageClass(pageOption);
                self.pages[pageName] = pg;

                self.currentPage = pageName;
                if (typeof callback === 'function') {
                    callback(pg);
                }
            });
        },
        listeners: {
            'route': function (evt, path) {
                router.route(path);
            }
        }
    });
    return App;
});