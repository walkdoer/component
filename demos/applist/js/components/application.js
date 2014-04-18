/**
 * [Compoennt] 应用
 */
define(function(require, exports) {
    'use strict';
    require('pages/category');
    require('pages/index');
    var $ = require('core/selector'),
        Component = require('lib/com');

    var App = Component.extend({
        type: 'application',
        _pages: null,
        _firstInitial: true,
        init: function (option) {
            this._super(option);
            this.initVar(['beforeLoad']);
        },
        /**
         * 切换页面
         */
        changePage: function (pageName, env, data) {
            var self = this,
                id = 'page-' + pageName,
                currentPage = self.getChildById(self.currentPage),
                newPg = self.getChildById(id);
            //当前页面与要切换的页面相同，不需要切换
            if (currentPage && currentPage.id === id) {
                currentPage.update(env, data);
                return;
            }
            //如果当前页存在,则隐藏
            if (currentPage) {
                currentPage.hide();
            }
            //如果页面已经建立就直接显示页面
            if (newPg) {
                newPg.show().update(env, data);
            } else {
                //页面没有建立，创建页面
                this._createPage(pageName, env, data, function (page) {
                    self.appendChild(page);
                    //page.render().appendToParent();
                    self.render().appendToParent();
                });
            }
            this.currentPage = id;
            return this;
        },
        _createPage: function (pageName, env, pageOption, callback) {
            var self = this;
            //读取类文件
            require.async('pages/' + pageName, function (PageClass) {
                //创建类
                var defaultOption = {
                    id: 'page-' + pageName,
                    parentNode: self,
                    env: env,
                    listeners: {
                        'beforerender': function (evt, page) {
                            //如果要加载的页面没有页面模板，则不清空Body
                            if (self._firstInitial) {
                                $(self.beforeLoad).hide();
                            }
                        },
                        'afterrender': function (/*evt, page*/) {
                            self._firstInitial = false;
                        }
                    }
                };
                pageOption = $.extend({}, defaultOption, pageOption);
                var page = new PageClass(pageOption);
                page.$el = $(page.el);
                callback(page);
            });
        }
    });
    return App;
});
