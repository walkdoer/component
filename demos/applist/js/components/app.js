/**
 * [组件] 按钮
 */
define(function (require, exports) {
    'use strict';
    var Component = require('lib/com'),
        Util = require('util'),
        Logger = require('logger'),
        /* --- Start of 常量 --- */
        CLASS_INSTALL = 'install',
        CLASS_PROCESSING = 'processing',
        FULL_CLASS_INSTALL = '.' + CLASS_INSTALL,
        CLASS_INSTALLED = 'installed',
        CLASS_DEFAULT_ICON = 'icn',
        ADD_SPEED_DIAL_SOURCE = 'webstorei',
        URL_TYPE_OTHER_EXT = 'other-ext',
        /* --- End of 常量 --- */
        App;
    function buildDialogParams(appInfo){
        var params = [];

        var id = appInfo.id;
        var name = appInfo.name;
        var icon = appInfo.logoUrl;
        var rawUrl = appInfo.rawUrl;
        var source = ADD_SPEED_DIAL_SOURCE;
        var isShow = appInfo.partner == 0? '1' : '0';
        params.push(id + '');
        params.push(name);
        params.push(icon);
        params.push(rawUrl);
        params.push(source);
        params.push(isShow);
        return params;
    }

    App = Component.extend({
        type: 'app',
        tpl: '#tpl-item-app',
        uiEvents: {
            'click .btn': function (e, app) {
                var appInfo = app.originOption.data;
                Logger.log({
                    path: app.getAbsPath(),
                    r: 'add_app',
                    n: appInfo.name,
                    id: appInfo.id
                });
                app.install();
                e.stopPropagation();
                e.stopImmediatePropagation();
            },
            'click .app': function () {
                var appInfo = this.originOption.data;
                var rawUrl = appInfo.rawUrl;
                var params = buildDialogParams(appInfo);

                Logger.ajaxLogWithApi('jump_log', {
                        path: this.getAbsPath(),
                        r: 'app_item_click',
                        id: appInfo.id,
                        n: appInfo.name,
                        tu: appInfo.url
                    },
                    function(data, status, xhr) {
                        if(data != null && data.supportDialog){
                            if(rawUrl == URL_TYPE_OTHER_EXT){
                                window.location.href = appInfo.url;
                                return;
                            }
                            window.ucweb.startRequest('shell.openAddSpeedDialBanner',params);
                        }else{
                            window.location.href = appInfo.url;
                        }
                    },
                    function(xhr, errorType, error) {
                        if(error != null && error.supportDialog){
                            if(rawUrl == URL_TYPE_OTHER_EXT){
                                window.location.href = appInfo.url;
                                return;
                            }
                            window.ucweb.startRequest('shell.openAddSpeedDialBanner',params);
                        }else{
                            window.location.href = appInfo.url;
                        }
                    }
                );
            },
            'touchstart .app': function (){
                var appInfo = this.originOption.data;
                var id = appInfo.id;
                var appItem = $("li[data-id='" + id + "']");
                appItem.css('background', '#f5f5f5');
                var timer = setTimeout(function(){
                    appItem.css('background', '');
                    clearTimeout(timer);
                    timer = null;
                }, 200);
            }
        },
        listeners: {
            'beforetmpl': function (evt, data) {
                data.star = data.star || 60;
                data.installed = data.installed ? 'installed' : 'install';
            },
            'afterrender': function () {
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
