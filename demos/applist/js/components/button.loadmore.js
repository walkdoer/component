/**
 * [Component][Button] 加载更多按钮
 */
define(function (require, exports) {
    'use strict';
    var Button = require('components/button'),
        typeName = 'loadMoreButton',
        LoadMoreButton,
        LOADING = 1,
        DONE = 2,
        FAIL = 3;
    LoadMoreButton = Button.extend({
        type: typeName,
        init: function (option) {
            var self = this;
            self._super(option);
            self.$loading = self.$el.find('.loading-icon');
            self.$btnText = self.$el.find('.btn-text');
            self.loadingMsg = self.$el.data('loading');
            self.failMsg = self.$el.data('fail');
            self.doneMsg = self.$el.data('done');
        },
        done: function () {
            return this.setStatus(DONE);
        },
        fail: function () {
            return this.setStatus(FAIL);
        },
        setStatus: function (status) {
            var self = this,
                $loading = self.$loading,
                $txt = self.$btnText;
            switch (status) {
            case LOADING :
                self.loading = true;
                $loading.show();
                $txt.html(self.loadingMsg);
                break;
            case DONE:
                self.loading = false;
                $loading.hide();
                $txt.html(self.doneMsg);
                break;
            case FAIL:
                self.loading = false;
                $txt.html(self.failMsg);
                break;
            }
            return self;
        },
        uiEvents: {
            'click': function () {
                var self = this;
                if (!self.loading) {
                    self.setStatus(LOADING);
                    self.trigger('load', [self, event]);
                }
            }
        }
    });
    return LoadMoreButton;
});
