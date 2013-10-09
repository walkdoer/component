/**
 * [组件] 按钮
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Button;

    Button = Component.extend({
        type: 'button',
        tplContent: '<button><%=data.title%></button>',
        init: function (option) {
            var self = this;
            this._super(option);
            this.on('click', 'button', function (event) {
                self.trigger(self.getType() + ':click', [self, event]);
            });
        }
    });
    return Button;
});