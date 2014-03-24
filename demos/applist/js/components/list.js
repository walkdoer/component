/**
 * [组件] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var $ = require('core/selector'),
        Component = require('lib/com'),
        Model = require('model'),
        LoadMoreButton = require('components/button.loadmore'),
        typeName = 'list',
        loadBtnId = 'loadMore',
        /*--- 常量 ---*/
        LOADING = 1,
        DONE = 2,
        NO_DATA = 3,
        List;
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
            //empty list
            self.empty();
            //set list status to loading status
            self.setStatus(LOADING);
            //load again
            self.load(true);
        },
        empty: function () {
            //改变visibility减少浏览器
            this.$list.css('visibility', 'hidden');
            this.removeAllChild();
            this.$list.css('visibility', 'visible');
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
            if (refresh) {
                self.pageNum = 0;
            }
            if (!self.btn) {
                self.btn = self.getChildById(loadBtnId);
            }
            //设置pageSize
            params.pageSize = refresh ? listSize : loadSize;
            //设置pageNo
            params.pageNo = self.pageNum;
            pageGap = refresh ? listSize / loadSize : 1;
            Model.get(this.api, params, function (data) {
                var recordArray = data.data || [],
                    dataLen = recordArray.length;
                self.first = false;
                self.btn.done();
                //页数
                self.pageNum += pageGap;
                if (data.isMore && dataLen >= params.pageSize) {
                    self.btn.show();
                } else {
                    self.btn.hide();
                }
                self.appendRecord(recordArray);
            }, function () {
                self.setStatus(DONE);
                self.btn.fail().show();
            });
            return this;
        },
        appendRecord: function (recordArray) {
            this.trigger('before:append', [recordArray]);
            var self = this,
                items = [],
                recordCount = recordArray.length,
                Li = self.originOption.li;
            if (!recordCount) {
                return self.setStatus(NO_DATA);
            }
            if (recordCount) {
                self.setStatus(DONE);
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
            }
        },
        uiEvents: {
            'click li': function (e) {
                this.trigger('click', [e]);
            },
        }
    });
    /*静态常量*/
    List.LOADING = LOADING;
    List.DONE = DONE;
    List.NO_DATA = NO_DATA;
    return List;
});
