/**
 * [页面] 首页
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/node.display'),
        TopBar = require('components/topbar'),
        AutoFillList = require('components/list.autofill'),
        AppItem = require('components/app'),
        util = require('util'),
        installedApps = [],
        Category;

    Category = Component.extend({
        name: 'category',
        components: [{
            _constructor_: TopBar,
            option: {
                state: ['queries.name']
            }
        }, {
            _constructor_: AutoFillList,
            option: {
                id: 'cateList',
                listSize: 10,
                loadSize: 5,
                tpl: '#tpl-list-app',
                api: 'apps',
                state: ['params.cat', 'queries.name'],
                li: AppItem
            }
        }],
        listeners: {
            //分类详情页渲染结束
            'AFTER_RENDER': function () {
                //渲染结束，则通知列表加载数据
                var list = this.getChildById('cateList');
                list.load();
            },
            //剔除已安装App,并保存到临时数组installedApps中
            'autofillList:cateList:before:append': function (event, apps) {
                util.updateAppStatus(apps);
                installedApps = installedApps.concat(util.sliceInstalledApps(apps));
            },
            'autofillList:cateList:end': function (event, list) {
                list.appendRecord(installedApps);
                installedApps = [];
            },
        }
    });
    return Category;
});