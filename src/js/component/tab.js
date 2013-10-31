/**
 * [组件] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Tab;

    Tab = Component.extend({
        type: 'tab',
        tpl: '#tpl-tab',
        init: function (option) {
            this.activeClass = option.activeClass || 'on';
            this._super(option);
        },
        events: {
            'CLICK': 'tab:click',
            'BEFORE_ACTIVE': 'before:tab:active',
            'BEFORE_CHANGE': 'before:pane:change',
            'ACTIVED': 'tab:actived',
            'CHANGED': 'tab:changed',
        },
        uiEvents: {
            'click .n-u-l': function (e) {
                console.log('tab 点击');
                var $target = $(e.target);
                this.trigger(this.events.CLICK, [this, $target.attr('data-target')]);
                this.activeTab($target);
            },
        },
        activeTab: function ($tab) {
            var self = this;
            var next = {};
            if (self.state === $tab.attr('data-target')) {
                //console.debug('点击同一个tab, 无需切换');
                return;
            }
            self.trigger(self.events.BEFORE_ACTIVE, [self, next]);
            if (next.go === false) {
                //用户取消切换，直接return
                return;
            } else {
                self.$tabs.removeClass(self.activeClass);
                //激活tab
                next.go = true;
                $tab.addClass(self.activeClass);
                self.$curTab = $tab;
                self.trigger(self.events.ACTIVED, [self, next]);
                if (next.go === false) {
                    return;
                }
                //改变Tab主体内容，setTimeout是为了保证程序同步执行
                //使用router组件的时候出现过程序逻辑不同步的问题
                setTimeout(function () {
                    self.changePane($tab);
                }, 0);
            }
        },
        /**
         * 切换Tab页面内容
         */
        changePane: function ($tab) {
            var target = $tab.attr('data-target'),
                $pane,
                next = {};
            if (!target) {
                console.warn('tab的data-target为空');
                return;
            } else {
                this.trigger(this.events.BEFORE_CHANGE, [this, next]);
                if (next.go === false) {
                    return;
                } else {
                    //隐藏当前页
                    if (this.$curPane) {
                        this.$curPane.hide();
                    }
                    $pane = this.$el.find('.' + target);
                    //显示新页 编写代码时 zepto .show()有bug,如果元素未添加到Dom树中,show是无效的
                    $pane.css('display', 'block');
                    this.$curPane = $pane;
                    this.state = target;
                    this.trigger(this.events.CHANGED, [this]);
                }
            }
        },
        listeners: {
            'AFTER_RENDER': function (evt, tab) {
                this.$curTab = tab.$parent.find('ul').find('[data-target=' + this.params.tab + ']');
                this.$tabs = tab.$parent.find('ul').find('li');
                this.activeTab(this.$curTab);
            }
        }
    });
    return Tab;
});