/**
 * [Component] 类别
 */
define(function (require, exports) {
    'use strict';
    var Component = require('lib/com'),
        Util = require('util'),
        Category;

    Category = Component.extend({
        type: 'app',
        tpl: '#tpl-item-category',
        listeners: {
            'beforetmpl': function(evt, data) {
                data.info = data.id + ':' + data.name;
                console.log('data', data);
            },
            'afterrender': function () {
                var $el = this.$el;
                Util.loadAppIcon($el.attr('data-icon'), $el.find('.icn'));
            }
        }
    });
    return Category;
});
