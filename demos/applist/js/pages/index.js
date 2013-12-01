/**
 * [页面] 首页
 */
define(function (require, exports) {
    'use strict';
    var $ = require('core/selector'),
        _ = require('core/lang'),
        Util = require('util'),
        Logger = require('logger'),
        Component = require('base/node.display'),
        Logo = require('components/logo'),
        Tab = require('components/tab'),
        InputHistory = require('components/input_history'),
        TextField = require('components/textfield'),
        List = require('components/list'),
        AutoFillList = require('components/list.autofill'),
        Form = require('components/form'),
        //数据配置，栏目配置
        config = {
            /* tabName: [模板, 返回数据接口, 列表项构造函数] */
            recommend: ['app', 'apps', require('components/app')],
            category: ['category', 'categorys', require('components/category')]
        },
        /* --- 常量 --- */
        STORAGE_KEY_INSTALLED_APP = 'installedApps',
        URL_ADDER_ID = 'urlAdder',
        installedApps = [],
        Index;
    function createUrlAdder(parent) {
        return new Form({
            id: URL_ADDER_ID,
            tpl: '#tpl-url-adder',
            parentEl: parent.el,
            parentNode: parent,
            components: [{
                _constructor_: TextField,
                id: 'url',
                selector: '#field-url'
            }, {
                _constructor_: TextField,
                id: 'name',
                selector: '#field-name'
            }],
            uiEvents: {
                'touchmove': function (event) {
                    //禁用touchmove事件
                    event.preventDefault();
                }
            },
            listeners: {
                'SUBMIT': function (event, form, uiEvent, urlInfo) {
                    Logger.log({
                        path: form.getAbsPath(),
                        //日志来源区域
                        r: 'add_url'
                    });
                    Util.addUrlToUCBrowserSpeedail(urlInfo.name, urlInfo.url);
                    this.getChildById('url')
                        .getChildById('inputHistory').addHistory(urlInfo);
                    //清空，隐藏表单
                    this.clear().hide();
                },
                'CANCEL': function () {
                    this.hide();
                },
                'textfield:url:input': _.debounce(function (event, field) {
                    var form = this,
                        inputHistory = field.getChildById('inputHistory'),
                        //由于时间关系，这部分代码先和HTML结构耦合，下一个版本解决耦合问题
                        //耦合处：field.$el.find('.clear')
                        $iconClear = field.$el.find('.clear');
                    $iconClear[field.value ? 'show' : 'hide']();
                    if (!inputHistory) {
                        //创建输入历史组件
                        inputHistory = new InputHistory({
                            id: 'inputHistory',
                            //输入历史提示框的宽度与输入框宽度一样
                            width: field.$el.find('input').width(),
                            parentNode: field,
                            parentEl: field.el,
                            tplContent: $('#tpl-input-history').html(),
                            childTplContent: $('#tpl-input-history-item').html(),
                            storageKey: 'add-url-history',
                            //保存历史记录数量上限
                            storageSize: 20,
                            //显示历史记录上限
                            showSize: 4,
                            //过滤器
                            filter: function (historyItem, matchVal) {
                                return historyItem.url.indexOf(matchVal) >= 0;
                            },
                            uiEvents: {
                                'click li': function (event) {
                                    var target = event.target;
                                    form.set({
                                        name: target.dataset.name,
                                        url: target.innerHTML
                                    });
                                }
                            }
                        })
                        .render()
                        .appendToParent();
                        //让下拉框组件成为该textfield的子组件
                        field.appendCmp(inputHistory);
                    }
                    inputHistory.show().filte(field.value);
                }),
                //url输入框失去焦点，隐藏历史记录下拉框
                'textfield:url:blur': function (event, field) {
                    //延时执行目的是为避免下拉菜单隐藏之后无法点击下拉菜单列表项
                    var timer = setTimeout(function () {
                        field.getChildById('inputHistory').hide();
                        clearTimeout(timer);
                    }, 100);
                }
            }
        });
    }
    Index = Component.extend({
        name: 'index',
        components: [{
            _constructor_: Logo,
            id: 'topLogo'
        }, {
            _constructor_: Tab,
            id: 'indexTab',
            getState: function () {
                return {
                    tab: this.state.params.tab
                };
            }
        }],
        init: function (option) {
            this._lists = {};
            this._super(option);
        },
        getInstalledApp: function () {
            var storage = sessionStorage.getItem(STORAGE_KEY_INSTALLED_APP);
            return JSON.parse(storage) || [];
        },
        listeners: {
            //tab标签已激活
            'tab:indexTab:click': function (evt, tab, target) {
                this.trigger('route', this.name + '/' + target);
            },
            //tab切换之后创建并加装列表,"推荐列表(recommend)"使用autofilllist组件，带有自动补全功能
            //分类使用普通列表组件
            'tab:indexTab:changed': function (evt, tab) {
                var tabName = tab.tabName,
                    list = this._lists[tabName],
                    listConfig = config[tabName],
                    ListConstructor;
                ListConstructor = tabName === 'recommend' ? AutoFillList : List;
                if (!list) {
                    list = new ListConstructor({
                        id: tabName,
                        api: tabName,
                        listSize: 20,
                        loadSize: 10,
                        parentNode: tab,
                        parentEl: tab.$curPane[0],
                        tpl: '#tpl-list-' + listConfig[0],
                        li: listConfig[2]
                    });
                    this._lists[tabName] = list;//TODO 改写了getCmp方法之后可以直接通过getCmp方法来获得
                    //tab添加list组件
                    tab.appendCmp(list);
                    //list组件渲染自己
                    list.render().load().appendToParent();
                }
            },
            //推荐列表添加到列表项之前检查app的安装状态
            'autofillList:recommend:before:append': function (event, apps) {
                //更新app的安装状态
                Util.updateAppStatus(apps);
                //从App列表中得已安装剔除掉，并将剔除出来的已安装App暂时保持起来
                installedApps = installedApps.concat(Util.sliceInstalledApps(apps));
            },
            //推荐列表加载结束
            'autofillList:recommend:end': function (event, list) {
                //将临时保持的已安装列表添加到列表中
                list.appendRecord(installedApps);
                installedApps = [];
            },
            //点击分类列表的某个子项
            'list:category:click': function (evt, e) {
                var target = e.currentTarget,
                    info = target.dataset.info.split(':');
                this.trigger('route', ['category/' + info[0], {name: info[1]}]);
            },
            //点击添加Url
            'logo:topLogo:addurl': function () {
                var page = this,
                    urlAdder = page.getChildById(URL_ADDER_ID);
                //创建URL表单，并成为页面的子组件
                if (!urlAdder) {
                    urlAdder = createUrlAdder(page);
                    //将组件添加到页面中
                    page.appendCmp(urlAdder);
                    //渲染组件并添加到页面中
                    urlAdder.render().appendToParent();
                }
                urlAdder.show();
            }
        }
    });
    return Index;
});