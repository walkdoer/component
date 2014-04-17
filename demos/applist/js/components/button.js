/**
 * [Component] 按钮
 */
define(function (require) {
    'use strict';
    var Component = require('lib/com'),
        typeName = 'button',
        Button;
    Button = Component.extend({
        type: typeName,
        tplContent: '<button><%title%></button>',
        uiEvents: {
            'click': function (event, btn) {
                btn.trigger('click', [this, event]);
            }
        }
    });
    return Button;
});
