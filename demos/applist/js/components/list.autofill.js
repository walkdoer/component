/**
 * [Component][List] 自动补全列表
 */
define(function (require, exports) {
    'use strict';
    var List = require('components/list'),
        typeName = 'autofillList',
        AutoFillList;
    AutoFillList = List.extend({
        type: typeName,
        init: function (option) {
            var self = this;
            self._super(option);
            self.firstAppend = true;
            self.stockItems = [];
            //补全阈值：如果小于该阈值，则需要重新发请求补全
            this.loadAgainThreshHold = this.listSize / 2;
        },
        /**
         * {Override} 带有自动补全功能
         * @param  {Array} records  后端接口返回的数据
         */
        appendRecord: function (records, hasMore, callback) {
            var self = this,
                originLength = records.length;
            this.trigger('beforeappend', records);
            console.log('originLength:' + originLength);
            //将上一次存货和这一次的请求合并
            records = records.concat(this.stockItems);
            //没有数据
            if (!originLength) {
                self.btn.hide();
                return self.setStatus(List.NO_DATA);
            }
            //条数大于阈值，不需要多发一个请求加载数据
            if (records.length >= this.loadAgainThreshHold || !hasMore || !this.firstAppend) {
                this.firstAppend = false;
                self.setStatus(List.DONE);
                self.btn.done();
                self._super(records);
                this.stockItems = [];//这里不要改成null
                if (callback) {
                    callback();
                }
            } else { //需要多发一个请求来补全条数
                this.stockItems = records;
                this.load();
            }
            if (!hasMore) {
                this.trigger('end', this);
            }
            return self;
        }
    });
    return AutoFillList;
});
