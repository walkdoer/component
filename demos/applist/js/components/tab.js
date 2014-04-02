/**
 * [Component] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var  $ = require('core/selector'),
        Component = require('lib/com'),
        typeName = 'tab',
        Tab;
    Tab = Component.extend({
        type: typeName,
        tpl: '#tpl-tab',
        init: function (option) {
            this.activeClass = option.activeClass || 'on';
            this._super(option);
        },
        uiEvents: {
            'click .n-u-l': function (e, tab) {
                var $target = $(e.target),
                    tabName = $target.attr('data-target');
                tab.trigger('click', this, tabName);
                tab.activeTab(tabName);
            }
        },
        getState: function () {
            return {
                tab: this.evn.params.tab
            };
        },
        update: function () {
            this.activeTab(this.state.tab);
            this._super();
        },
        activeTab: function (tabName) {
            if (!tabName) { return; }
            var $tab = this.$curTab = this.$el.find('ul').find('[data-target=' + tabName + ']');
            var self = this;
            var next = {};
            if (self.tabName === $tab.attr('data-target')) {
                return;
            }
            self.trigger('beforeactive', self, next);
            if (next.go === false) {
                //用户取消切换，直接return
                return;
            } else {
                self.$tabs.removeClass(self.activeClass);
                //激活tab
                next.go = true;
                $tab.addClass(self.activeClass);
                self.$curTab = $tab;
                self.trigger('actived', self, next);
                if (next.go === false) {
                    return;
                }
                //切换Tab主体内容
                self.changePane(tabName);
            }
        },
        /**
         * 切换Tab页面内容
         */
        changePane: function (tabName) {
            var self = this,
                $pane,
                next = {};
            self.trigger('before:change', self, next);
            if (next.go === false) {
                return;
            } else {
                //隐藏当前页
                if (self.$curPane) {
                    self.$curPane.hide();
                }
                $pane = self.$el.find('.' + tabName);
                //显示新页 编写代码时 zepto .show()有bug,如果元素未添加到Dom树中,show是无效的
                $pane.css('display', 'block');
                self.$curPane = $pane;
                self.tabName = tabName;
                self.trigger('changed', self);
            }
        },
        listeners: {
            'afterrender': function (evt, tab) {
                tab.$tabs = tab.$el.find('ul').find('li');
                tab.activeTab('recommend');
            }
        }
    });
    return Tab;
});
