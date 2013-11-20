/**
 * [Component] 输入历史记录下拉框
 */
define(function (require, exports) {
    'use strict';
    var $ = require('core/selector'),
        Event = require('base/event'),
        Component = require('base/node.display'),
        typeName = 'inputHistory',
        InputHistory;
    Event.add(typeName, {
        CLICK: 'click'
    });
    InputHistory = Component.extend({
        type: typeName,
        init: function (option) {
            this._super(option);
            this.initVar(['storageKey', 'childTplContent', 'storageSize', 'showSize', 'filter']);
        },
        /**
         * {Private} 获取匹配的历史记录
         * @param  {String} keyword 关键词
         * @return {Array}  匹配的历史记录数组
         */
        _getMatchHistory: function (keyword) {
            var inputHistoryArray = JSON.parse(localStorage.getItem(this.storageKey)),
                historyItem,
                matchArray = [],
                len,
                i;
            if (!inputHistoryArray) {
                return [];
            }
            for (i = 0, len = inputHistoryArray.length; i < len; i++) {
                historyItem = inputHistoryArray[i];
                if (this.filter(historyItem, keyword)) {
                    matchArray.push(historyItem);
                }
            }
            return matchArray;
        },
        /**
         * 添加历史记录
         * @param {Object} historyItem 历史记录
         */
        addHistory: function (historyItem) {
            var inputHistoryArray = JSON.parse(localStorage.getItem(this.storageKey)) || [],
                sameHistory = this._getMatchHistory(historyItem.url);
            //没有存在同样的历史记录
            if (sameHistory.length === 0) {
                //插入到数组最前位置
                inputHistoryArray.unshift(historyItem);
            }
            //按照配置的Size截取历史记录
            inputHistoryArray = inputHistoryArray.slice(0, this.storageSize);
            //save
            localStorage.setItem(this.storageKey, JSON.stringify(inputHistoryArray));
            return this;
        },
        /**
         * 过滤历史记录
         * @param  {String} value 关键词
         */
        filte: function (keyword) {
            var historyArray = this._getMatchHistory(keyword),
                historyItem,
                fragment = document.createDocumentFragment(),
                len;
            //截取最前的 showSize 条数据
            historyArray = historyArray.slice(0, this.showSize);
            len = historyArray.length;
            for (var i = 0; i < len; i++) {
                historyItem = historyArray[i];
                fragment.appendChild($(this.tmpl(historyItem, this.childTplContent))[0]);
            }
            this.$el.empty().append(fragment);
            return this;
        }
    });
    return InputHistory;
});