/**
 * [Component] 输入框
 */
define(function (require, exports) {
    'use strict';
    var _ = require('core/lang'),
        $ = require('core/selector'),
        Component = require('lib/com'),
        typeName = 'textfield',
        Textfield;
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
                this.trigger('input', [this]);
            }, 300),
            'blur input': function () {
                this.trigger('blur', [this]);
            }
        }
    });
    return Textfield;
});
