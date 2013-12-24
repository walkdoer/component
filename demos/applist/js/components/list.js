/**
 * [组件] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var $ = require('core/selector'),
        Component = require('base/node.display'),
        Model = require('model'),
        Event = require('base/event'),
        LoadMoreButton = require('components/button.loadmore'),
        typeName = 'list',
        loadBtnId = 'loadMore',
        /*--- 常量 ---*/
        LOADING = 1,
        DONE = 2,
        NO_DATA = 3,
        List;
    Event.add(typeName, {
        CLICK: 'click'
    });
    List = Component.extend({
        type: typeName,
        components: [{
            _constructor_: LoadMoreButton,
            id: loadBtnId,
            tpl: '#tpl-btn-loadmore',
            display: false
        }],
        init: function (option) {
            var self = this,
                $el;
            self._super(option);
            $el = self.$el; //注意：只有上一级Display初始化之后才会有对象才有$el属性
            self.pageNum = 0;
            self.first = true;
            self.initVar(['childTpl', 'api', 'listSize', 'loadSize']);
            self.$list = $el.find('ul');
            self.$msg = $el.find('.list-msg');
            self.emptyMsg = $el.data('empty');
            self.loadingMsg = $el.data('loading');
            self.$msg.html(self.loadingMsg);
            self.stockItems = [];
        },
        update: function () {
            var self = this;
            self.setStatus(LOADING);
            self.empty();
            self.load(true);
        },
        empty: function () {
            this.removeAllChild().$list.empty();
        },
        setStatus: function (state) {
            var $msg = this.$msg;
            switch (state) {
            case LOADING:
                $msg.html(this.loadingMsg).show();
                break;
            case DONE:
                $msg.hide();
                break;
            case NO_DATA:
                $msg.html(this.emptyMsg).show();
                break;
            }
        },
        load: function (refresh) {
            var self = this,
                //由于params代表了组件的状态，所以使用copy，
                //而不是在params对象修改，避免影响页面状态
                params = $.extend({}, self.params),
                listSize = self.listSize,
                loadSize = self.loadSize,
                pageGap;
            //第一次加载和强制刷新都重新加载数据
            refresh = self.first || refresh;
            if (!self.btn) {
                self.btn = self.getChildById(loadBtnId);
            }
            if (refresh) {
                self.pageNum = 0;
                self.btn.hide();
            }
            //设置pageSize
            params.pageSize = refresh ? listSize : loadSize;
            //设置pageNo
            params.pageNo = self.pageNum;
            pageGap = refresh ? listSize / loadSize : 1;
            Model.get(this.api, params, function (data) {
                var records = data.data || [],
                    dataLen = records.length;
                self.first = false;
                //页数
                self.pageNum += pageGap;
                self._appendRecord(records, data.isMore, function () {
                    if (data.isMore && dataLen >= params.pageSize) {
                        self.btn.show();
                    } else {
                        self.btn.hide();
                    }
                });
            }, function () {
                self.setStatus(DONE);
                self.btn.fail().show();
            });
            return this;
        },
        appendRecord: function (recordArray) {
            var self = this,
                items = [],
                Li = self.originOption.li;
            $.each(recordArray, function (i, rec) {
                items.push(new Li({
                    id: ['app', rec.id].join('_'),
                    data: rec,
                    parentNode: self,
                    parentEl: self.$list[0],
                }));
            });
            self.appendCmp(items);
            self.render();
        },
        /**
         * 直接将返回结果添加到列表中
         * @param  {Array} records  后端接口返回的数据
         */
        _appendRecord: function (records, hasMore, callback) {
            var self = this;
            //没有数据
            if (!records.length) {
                self.btn.hide();
                return self.setStatus(NO_DATA);
            }
            if (records.length) {
                self.setStatus(DONE);
                self.btn.done();
                self.appendRecord(records);
                if (callback) {
                    callback();
                }
            }
            return self;
        },
        uiEvents: {
            'click li': function (e) {
                this.trigger('CLICK', [e]);
            },
        },
        listeners: {
            'loadMoreButton:loadMore:load': function () {
                this.load();
            }
        }
    });
    /*静态常量*/
    List.LOADING = LOADING;
    List.DONE = DONE;
    List.NO_DATA = NO_DATA;
    return List;
});