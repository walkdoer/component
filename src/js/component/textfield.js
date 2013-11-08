/**
 * [组件] 按钮
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
        'INPUT': 'input'
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
                //由于时间关系，这部分代码先和HTML结构耦合，下一个版本解决耦合问题
                //耦合处：$field.parent().find('.clear');
                var $field = $(event.target),
                    value = $field.val(),
                    $iconClear = $field.parent().find('.clear');
                this.value = value;
                $iconClear[value ? 'show' : 'hide']();
                this.trigger('INPUT', [this]);
            }, 300)
        }
    });
    return Textfield;
});