/**
 * [页面] 首页
 */
define(function (require) {
    'use strict';
    var Component = require('lib/com'),
        model = require('model'),
        Header = require('components/header'),
        List = require('components/list.base'),
        Button = require('components/button'),
        App = require('components/app'),
        Category = require('components/category'),
        Index;

    function queryData(key, value, data) {
        var result = [],
            item;
        for (var i = 0, len = data.length; i < len; i++) {
            item = data[i];
            if (item[key] === value) {
                result.push(item);
            }
        }
        return result;
    }

    var pageIdPrefix = 'index-',
        listIdPrefix = pageIdPrefix + 'list-';

    Index = Component.extend({
        name: 'index',
        components: [{
            _constructor_: Header,
            id: 'index-header'
        }, {
            _constructor_: Component,
            tpl: '#tpl-index-loading',
            listeners: {
                //渲染成功之后加载数据
                'afterrender': function () {
                    var self = this,
                        page = this.parentNode;
                    model.get('index', {}, function (result) {
                        //渲染列表
                        self.hide();
                        page._renderList(result.data);
                    },
                    //加载数据失败
                    function () {
                        self.hide();
                        page.showError();
                    });
                }
            }
        }],
        _renderList: function (result) {
            var that = this;
            //创建Feature模块
            this.appendChild(this._createAppList('Feature', result));

            //创建category模块
            var categoryData = queryData('groupName', 'Category', result)[0].data;
            this.appendChild(this._createCategoryList(categoryData));

            //创建New模块
            this.appendChild(this._createAppList('New', result));
            //重新渲染页面
            that.render();
        },
        _createAppList: function (listName, result) {
            //加载数据
            var data = queryData('groupName', listName, result)[0].data;
            //创建列表
            var list = new List({
                id: listIdPrefix + listName,
                className: 'app-list top-radius',
                li: App
            });
            list.append(data);
            //创建列表加载更多按钮
            var loadMoreButton = new Button({
                className: 'load-more-btn bottom-radius',
                data: {
                    title: 'Load More'
                }
            });
            return this._wrapper([
                this._createListLable(listName),
                list,
                loadMoreButton
            ]);
        },
        _createListLable: function (labelName) {
            return new Component({
                tpl: '#tpl-list-label',
                data: {
                    name: labelName
                }
            });
        },
        _wrapper: function (components) {
            return new Component({
                components: components,
                className: 'list-wrapper'
            });
        },
        _createCategoryList: function (data) {
            var lists = [],
                listSize = 4,
                len = data.length,
                groupNum = Math.floor(len / listSize),
                list,
                offset,
                otherClass;

            //label
            lists.push(this._createListLable('Category'));
            for (var i = 0; i <= groupNum; i++) {
                otherClass = (i === 0 ?
                        'top-radius' :
                        i === groupNum ?
                            'bottom-radius list-border-bottom' : '');
                list = new List({
                    id: listIdPrefix + 'category-' + i,
                    li: Category,
                    className: 'cate-list ' + otherClass
                });
                offset = i * listSize;
                list.append(data.slice(offset, offset + listSize));
                lists.push(list);
            }
            return this._wrapper(lists);
        }
    });
    return Index;
});
