/**
 * [Component] 输入框
 */
define(function (require) {
    'use strict';
    var _ = require('core/lang'),
        $ = require('core/selector'),
        Component = require('lib/com'),
        typeName = 'textfield',
        Textfield;
    Textfield = Component.extend({
        type: typeName,
        uiEvents: {
            'click .clear': function (e) {
                var $icon = $(e.target),
                    $field = $icon.parent().find('input');
                $field.val('');
                $icon.hide();
            },
            //input事件触发比较频繁，需要添加事件防抖
            'input input': _.debounce(function (e, field) {
                field.value = e.target.value;
                field.trigger('input', field);
            }, 300),
            'blur input': function (e, field) {
                field.trigger('blur', field);
            }
        }
    });
    return Textfield;
});
