define(function(require, exports) {
    'use strict';
    var $ = require('zepto'),
        _ = require('core/lang'),
        os = _.os,
        encode = encodeURIComponent,
        queryResult = '',
        CMD_INSTALL = 'ext:app_dl_id:',
        CMD_ADDTOHOME_IOS = 'ext:homepage_add:',
        CMD_GET_APPS_IOS = 'ext:app_get_items',
        CMD_ADDTOHOME_ANDROID = 'shell.forceSaveUrl',
        CMD_GET_APPS_ANDROID = 'shell.appstore.getItems',
        CLASS_NO_ICON = 'no-icon',
        requestAppInfoApI,
        appIds;
    if (_.os.iphone) {
        window.appstore = window.appstore || {};
        window.appstore.setItems = function (result) {
            queryResult = result;
        };
    } else {
        window.ucweb = window.ucweb || {};
        window.ucweb.startRequest = window.ucweb.startRequest || function () { return ''; };
    }
    /**
     * 更新已安装的应用列表
     * @return {Array}
     */
    function updateInstalledApps() {
        var resultArray;
        appIds = [];
        if (_.os.iphone) {
            var frame = document.createElement('iframe');
            frame.height = 0;
            frame.width = 0;
            frame.style.border = 0;
            frame.id = 'app-get-frame';
            frame.src = CMD_GET_APPS_IOS;
            document.body.appendChild(frame);
            frame.parentNode.removeChild(frame);
        } else if (_.os.android) {
            queryResult = window.ucweb.startRequest(CMD_GET_APPS_ANDROID);
        } else {
            //暂时不支持其他系统
        }
        resultArray = queryResult.split('~');
        $.each(resultArray, function (i, appItem) {
            var appInfoArray = appItem.split('|');
            appIds.push(parseInt(appInfoArray[0], 10));
        });
    }
    /**
     * 检查编号{id}的App是否已安装
     * @param  {Number}  id   应用编号
     * @return {Boolean}
     */
    function isAppInstalled(id) {
        updateInstalledApps();
        return appIds.indexOf(id) >= 0;
    }

    /**
     * 序列化对象 {a: 1, b: 2, c: 'd e'} 为 'a=1&b=2&c=d+e' 形式的 querystring
     *  若指定 appendTo，则将 appendTo 视为 url，并返回追加 querystring 后的 url
     *  否则直接返回 querystring
     * @param  {Object} data
     * @param  {String} appendTo
     * @return {String}
     */
    exports.param = function (data, appendTo) {
        var stack = [],
            query;

        _.each(data, function (value, key) {
            stack.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        });
        query = stack.join('&').replace(/%20/g, '+');

        if (typeof appendTo === 'string') {
            query = appendTo + (query.length > 0 ?
                (appendTo.indexOf('?') < 0 ? '?' : '&') + query :
                '');
        }
        return query;
    };

    /**
     * 安装App
     * @param  {[type]}   app      [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    exports.installApp = function (app, callback) {
        var installCommandArray = [];
        //命令格式 ext : app_dl_id : 应用ID标识 | 后台请求数据包URL | urlencode(应用名称) |
        installCommandArray.push(CMD_INSTALL + app.id, requestAppInfoApI, encodeURI(app.name), '');
        console.log(installCommandArray.join('|'));
        //UC浏览器特色，通过改变Href向客户端发送数据，颤抖吧，少年
        window.location.href = installCommandArray.join('|');
        //到目前为止（9.4版本），暂时无法得知应用的添加成功与否，所以这里只能模拟UI响应
        var timer = setTimeout(function () {
            clearTimeout(timer);
            timer = null;
            if (callback) {
                callback();
            }
        }, 900);
    };
    /**
     * 更新应用状态
     * @param  {Array} apps 应用列表
     */
    exports.updateAppStatus = function (apps) {
        var app;
        for (var i = 0, len = apps.length; i < len; i++) {
            app = apps[i];
            //如果应用已经安装，则将其存入SessionStorage，在列表的最好加上
            if (isAppInstalled(app.id)) {
                app.installed = true;
            } else {
                app.installed = false;
            }
        }
    };
    /**
     * 加载应用图标
     * @param  {String} iconUrl    应用图标地址
     * @param  {[type]} $imgHolder 存放url地址的$(DOM)
     */
    exports.loadAppIcon = function (iconUrl, $imgHolder) {
        var img = new Image();
        img.className = 'thumb';
        img.src = iconUrl;
        img.onload = function () {
            $imgHolder.append(img);
            $imgHolder.addClass(CLASS_NO_ICON);
            img = null;
        };
    };
    /**
     * 剔除已安装列表
     * @param  {Array} apps 应用列表
     * @return {Array}      剔除出来的已安装应用列表
     */
    exports.sliceInstalledApps = function (apps) {
        var installedApps = [],
            app;
        for (var i = 0, len = apps.length; i < len; i++) {
            app = apps[i];
            if (app.installed) {
                installedApps.push(apps.splice(i, 1)[0]);
                i--;
                len--;
            }
        }
        return installedApps;
    };
    /**
     * 添加Url到UC浏览器Speedial
     * @param {String} name 图标名称
     * @param {String} url  应用地址
     */
    exports.addUrlToUCBrowserSpeedail = function (name, url) {
        // 普通添加网址
        if (os.iphone) {
            window.location.href = CMD_ADDTOHOME_IOS + encode(name) + '|' + encode(url);
        } else if (os.android) {
            window.ucweb.startRequest(CMD_ADDTOHOME_ANDROID, ['4', '1', name, url, url, '']);
        }
    };

    exports.isAppInstalled = isAppInstalled;
    exports.init = function (_api) {
        requestAppInfoApI = _api;
    };
});