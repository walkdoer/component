/**
 * [Component] 按钮
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/node.display'),
        Event = require('base/event'),
        typeName = 'button',
        Button;
    Event.add(typeName, {
        'CLICK': 'click'
    });
    Button = Component.extend({
        type: typeName,
        tplContent: '<button><%=data.title%></button>',
        uiEvents: {
            'click': function (event) {
                this.trigger('CLICK', [this, event]);
            }
        }
    });
    return Button;
});