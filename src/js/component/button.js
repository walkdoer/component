/**
 * [组件] 按钮
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Button;

    Button = Component.extend({
        type: 'button',
        tplContent: '<button><%=data%></button>',
        init: function (option) {
            var self = this;
            this._super(option);
            this.on('click', '#' + self.id, function (event) {
                self.trigger([self.getType(), self.getName(), 'click'].join(':'), [self, event]);
            });
        },
        render: function () {
            this._super(this.originOption.title);
        }
    });
    return Button;
});