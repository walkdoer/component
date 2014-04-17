/**
 * [Component] 顶部导航条
 */
define(function (require) {
    'use strict';
    var Component = require('lib/com'),
        Util = require('util'),
        _ = require('core/lang'),
        InputHistory = require('components/input_history'),
        TextField = require('components/textfield'),
        Logger = require('logger'),
        Form = require('components/form'),
        URL_ADDER_ID = 'urladder',
        Header;
    Header = Component.extend({
        type: 'logo',
        tpl: '#tpl-top-nav',
        uiEvents: {
            'click .h-btn': function (e, logo) {
                var urlAdder = logo.getChildById(URL_ADDER_ID);
                //创建URL表单，并成为页面的子组件
                if (!urlAdder) {
                    urlAdder = createUrlAdder(logo);
                    //将组件添加到页面中
                    logo.appendChild(urlAdder);
                    //渲染组件并添加到页面中
                    urlAdder.render().appendToParent();
                }
                urlAdder.show();
            },
            'click .h-btn2': function () {
                this.trigger('bookmarks');
            }
        }
    });
    function createUrlAdder(parent) {
        return new Form({
            id: URL_ADDER_ID,
            tpl: '#tpl-url-adder',
            parentNode: parent,
            components: [{
                _constructor_: TextField,
                tpl: '#tpl-field',
                id: 'field-url',
                parentSelector: '.form-fields',
                data: {
                    text: 'Url',
                    name: 'url'
                }
            }, {
                _constructor_: TextField,
                parentSelector: '.form-fields',
                tpl: '#tpl-field',
                id: 'field-name',
                data: {
                    text: 'Name',
                    name: 'name'
                }
            }],
            uiEvents: {
                'touchmove': function (event) {
                    //禁用touchmove事件
                    event.preventDefault();
                }
            },
            listeners: {
                'submit': function (event, form, urlInfo) {
                    Logger.log({
                        path: form.getAbsPath(),
                        //日志来源区域
                        r: 'add_url'
                    });
                    Util.addUrlToUCBrowserSpeedail(urlInfo.name, urlInfo.url);
                    form.getChildById('inputHistory').addHistory(urlInfo);
                    //清空，隐藏表单
                    form.clear().hide();
                },
                'cancel': function () {
                    this.hide();
                },
                'textfield:field-url:input': _.debounce(function (event, field) {
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
                            tpl: '#tpl-input-history',
                            childTpl: '#tpl-input-history-item',
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
                        field.appendChild(inputHistory);
                    }
                    inputHistory.show().filte(field.value);
                }),
                //url输入框失去焦点，隐藏历史记录下拉框
                'textfield:field-url:blur': function (event, field) {
                    //延时执行目的是为避免下拉菜单隐藏之后无法点击下拉菜单列表项
                    var timer = setTimeout(function () {
                        field.getChildById('inputHistory').hide();
                        clearTimeout(timer);
                    }, 100);
                }
            }
        });
    }
    return Header;
});
