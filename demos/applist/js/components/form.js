/**
 * [Component] 表单
 */
define(function (require, exports) {
    'use strict';
    var $ = require('core/selector'),
        Component = require('base/node.display'),
        Event = require('base/event'),
        typeName = 'form',
        WARN_CLASS = 'warn',
        Form;
    Event.add(typeName, {
        CANCEL: 'cancel',
        SUBMIT: 'submit'
    });
    /*
    写给接手的人：由于时间较紧，在做form组件的时候是没有对输入框进行抽象为一个组件的
    所以form表单的粒度比较粗，建议抽出textfield组件
     */
    Form = Component.extend({
        type: typeName,
        /**
         * 字段合法性检查，现在暂时只是非空检查
         * @param  {Object} data
         * @return {Boolean}
         */
        _validate: function (data) {
            var $fields = this.$fields,
                validateResult = true;
            $fields.each(function (i, field) {
                var required = field.required;
                if (required && !data[field.name]) {
                    validateResult = false;
                    $(field).addClass(WARN_CLASS);
                    return false;//break loop
                }
            });
            return validateResult;
        },
        init: function (option) {
            this._super(option);
            this.$fields = this.$el.find('input');
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
        /**
         * 清空表单
         */
        clear: function () {
            this.$el[0].reset();
            return this;
        },
        set: function (data) {
            var $fields = this.$fields;
            $fields.each(function (i, field) {
                field.value = data[field.name];
            });
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
            },
            //输入框聚焦
            'focus input': function (event) {
                var $field = $(event.target);
                $field.removeClass(WARN_CLASS);
            }
        }
    });
    return Form;
});