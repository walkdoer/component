/**
 * [组件] 表单
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Event = require('base/event'),
        typeName = 'form',
        Form;
    Event.add(typeName, {
        CANCEL: 'cancel',
        SUBMIT: 'submit'
    });
    Form = Component.extend({
        type: typeName,
        /**
         * 字段合法性检查，现在暂时只是非空检查
         * @param  {Object} data
         * @return {Boolean}
         */
        _validate: function (data) {
            var $field = this.$el.find('input'),
                validateResult = true;
            $field.each(function (i, field) {
                var required = field.required;
                if (required && !data[field.name]) {
                    validateResult = false;
                    return false;//break loop
                }
            });
            return validateResult;
        },
        /**
         * 获取所有字段的值
         * @return {Object} 返回格式：{val1: 'text1', val2: 'text2'}
         */
        _getField: function () {
            var fieldValueArray = this.$el.serializeArray(),
                data = {};
            $.each(fieldValueArray, function (i, field) {
                data[field.name] = field.value;
            });
            return data;
        },
        uiEvents: {
            //提交按钮
            'submit': function (event) {
                event.preventDefault();
                var data = this._getField();
                if (this._validate(data)) {
                    this.trigger('SUBMIT', [this, event, data]);
                }
            },
            //取消按钮
            'click .cancel': function (event) {
                this.trigger('CANCEL', [this, event]);
            }
        }
    });
    return Form;
});