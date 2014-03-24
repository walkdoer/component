/**
 * [Component] 按钮
 */
define(function (require, exports) {
    'use strict';
    var Component = require('lib/com'),
        typeName = 'button',
        Button;
    Button = Component.extend({
        type: typeName,
        tplContent: '<button><%=data.title%></button>',
        uiEvents: {
            'click': function (event) {
                this.trigger('click', [this, event]);
            }
        }
    });
    return Button;
});
