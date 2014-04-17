/**
 * [组件] 顶部导航条
 */
define(function (require) {
    'use strict';
    var $ = require('core/selector'),
        Component = require('lib/com'),
        typeName = 'list',
        /*--- 常量 ---*/
        LOADING = 1,
        DONE = 2,
        NO_DATA = 3,
        List;
    List = Component.extend({
        type: typeName,
        tplContent: '<ul></ul>',
        init: function (option) {
            var self = this,
                $el;
            //执行父类初始化
            self._super(option);

            $el = self.$el;
            self.initVar(['childTpl', 'api']);
            self.$list = $el.find('ul');
            self.$msg = $el.find('.list-msg');
            self.emptyMsg = $el.data('empty');
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
            case DONE:
                $msg.hide();
                break;
            case NO_DATA:
                $msg.html(this.emptyMsg).show();
                break;
            }
        },
        append: function (recordArray) {
            this.trigger('beforeappend', recordArray);
            var self = this,
                items = [],
                recordCount = recordArray.length,
                Li = self.originOption.li;
            if (!recordCount && this.childCounts === 0) {
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
                self.appendChild(items);
                self.render();
            }
        },
        uiEvents: {
            'click li': function (e, list) {
                list.trigger('click', e);
            },
        }
    });
    /*静态常量*/
    List.LOADING = LOADING;
    List.DONE = DONE;
    List.NO_DATA = NO_DATA;
    return List;
});
