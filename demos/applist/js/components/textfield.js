/**
 * [Component] 输入框
 */
define(function (require, exports) {
    'use strict';
    var _ = require('core/lang'),
        $ = require('core/selector'),
        Component = require('base/component'),
        Event = require('base/event'),
        typeName = 'textfield',
        Textfield;
    Event.add(typeName, {
        'INPUT': 'input',
        'FLUR': 'blur'
    });
    Textfield = Component.extend({
        type: typeName,
        uiEvents: {
            'click .clear': function (event) {
                var $icon = $(event.target),
                    $field = $icon.parent().find('input');
                $field.val('');
                $icon.hide();
            },
            //input事件触发比较频繁，需要添加事件防抖
            'input input': _.debounce(function (event) {
                this.value = event.target.value;
                this.trigger('INPUT', [this]);
            }, 300),
            'blur input': function () {
                this.trigger('FLUR', [this]);
            }
        }
    });
    return Textfield;
});