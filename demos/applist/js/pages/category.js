/**
 *
 * [页面] 列表页
 */
define(function (require) {
    'use strict';
    var Component = require('lib/com'),
        TopBar = require('components/topbar'),
        AutoFillList = require('components/list.autofill'),
        AppItem = require('components/app'),
        util = require('util'),
        _ = require('core/lang'),
        installedApps = [],
        Category;

    Category = Component.extend({
        type: 'page',
        init: function (option) {
            //处理下滑刷新, _.debounce 为防抖函数
            //降低回调函数调用频率，提高性能
            window.onscroll = _.debounce(function () {
                console.log('scroll');
            }, 100);
            this._super(option);
        },
        components: [{
            _constructor_: TopBar,
            getState: function () {
                return {
                    name: this.env.queries.name
                };
            }
        }, {
            _constructor_: AutoFillList,
            id: 'cateList',
            listSize: 10,
            loadSize: 5,
            tpl: '#tpl-list-app',
            api: 'apps',
            li: AppItem,
            getState: function () {
                var env = this.env;
                return {
                    cat: env.params.cat,
                    name: env.queries.name
                };
            }
        }],
        listeners: {
            //分类详情页渲染结束
            'afterrender': function () {
                //渲染结束，则通知列表加载数据
                var list = this.getChildById('cateList');
                list.load();
            },
            //剔除已安装App,并保存到临时数组installedApps中
            'autofillList:cateList:beforeappend': function (event, apps) {
                util.updateAppStatus(apps);
                installedApps = installedApps.concat(util.sliceInstalledApps(apps));
            },
            'autofillList:cateList:end': function (event, list) {
                if (installedApps.length > 0) {
                    list.appendRecord(installedApps);
                }
                installedApps = [];
            },
        }
    });
    return Category;
});
