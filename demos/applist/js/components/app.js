/**
 * [组件] 按钮
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Util = require('util'),
        Logger = require('logger'),
        /* --- Start of 常量 --- */
        CLASS_INSTALL = 'install',
        CLASS_PROCESSING = 'processing',
        FULL_CLASS_INSTALL = '.' + CLASS_INSTALL,
        CLASS_INSTALLED = 'installed',
        CLASS_DEFAULT_ICON = 'icn',
        /* --- End of 常量 --- */
        App;

    App = Component.extend({
        type: 'app',
        tpl: '#tpl-item-app',
        uiEvents: {
            'click .install': function () {
                var appInfo = this.originOption.data;
                Logger.log({
                    path: this.getAbsPath(),
                    r: 'add_app',
                    n: appInfo.name,
                    id: appInfo.id
                });
                this.install();
            }
        },
        listeners: {
            'AFTER_RENDER': function () {
                var self = this,
                    $el = self.$el,
                    appData = self.el.dataset;
                //保存应用信息
                self.appInfo = {
                    id: appData.id,
                    name: appData.name,
                    url: appData.url
                };
                //加载图标
                Util.loadAppIcon($el.attr('data-icon'), $el.find('.' + CLASS_DEFAULT_ICON));
            }
        },
        /**
         * 安装应用
         * @param  {Object} app {id: '', name: ''}
         * @return
         */
        install: function () {
            var self = this,
                appInfo = self.appInfo;
            if (!this.installing) {
                this.installing = true;
                //改变为处理中样式
                this.$el.find(FULL_CLASS_INSTALL).addClass(CLASS_PROCESSING);
                Util.installApp(appInfo, function () {
                    self.installing = false;
                    self.$el.find(FULL_CLASS_INSTALL)
                            .removeClass([CLASS_INSTALL, CLASS_PROCESSING].join(' '))
                            .addClass(CLASS_INSTALLED);
                });
            } else {
                console.log('安装中');
            }
        }
    });
    return App;
});