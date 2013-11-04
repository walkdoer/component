/**
 * Application 应用类
 * @author zhangmhao@gmail.com
 */
define(function(require, exports) {
    'use strict';
    var Component = require('base/component');

    var App = Component.extend({
        type: 'application',
        _pages: null,
        _firstInitial: true,
        init: function (option) {
            this.startInit();
            this._super(option, true);
            this.initVariable(option, ['beforeLoad']);
            this.finishInit();
        },
        /**
         * 切换页面
         */
        changePage: function (pageName, state, data) {
            var curPg = this.getCmp(this.currentPage),
                newPg = this.getCmp(pageName);
            //当前页面与要切换的页面相同，不需要切换
            if (curPg && curPg.id === pageName) {
                curPg.update(state, data);
                return;
            }
            //隐藏当前页
            if (curPg) {
                curPg.hide();
            }
            //如果页面已经建立就直接显示页面
            if (newPg) {
                this.getCmp(pageName).show().update(state, data);
            } else {
                //页面没有建立，创建页面
                this._createPage(pageName, state, data);
            }
            this.currentPage = pageName;
            return this;
        },
        _createPage: function (pageName, state, pageOption, callback) {
            var self = this;
            //读取类文件
            require.async('pages/' + pageName, function (PageClass) {
                //创建类
                var defaultOption = {
                    id: pageName,
                    parent: self.el,
                    params: state.params,
                    queries: state.queries,
                    listeners: {
                        'BEFORE_RENDER': function (evt, page) {
                            //如果要加载的页面没有页面模板，则不清空Body
                            if (page.hasTplContent() && self._firstInitial) {
                                $(self.beforeLoad).hide();
                            }
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
                        },
                        'RENDERED': function (/*evt, page*/) {
                            self._firstInitial = false;
                        }
                    }
                };
                pageOption = $.extend({}, defaultOption, pageOption);
                var pg = new PageClass(pageOption);
                self.addCmp(pg);
                pg.render().appendToParent();
                self.render().appendToParent();
            });
        }
    });
    return App;
});