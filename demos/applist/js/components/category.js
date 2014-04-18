/**
 * [Component] 类别
 */
define(function (require) {
    'use strict';
    var Component = require('lib/com'),
        Util = require('util'),
        router = require('core/router'),
        Category;

    Category = Component.extend({
        type: 'app',
        tpl: '#tpl-item-category',
        uiEvents: {
            'click': function (e) {
                function route(path, params) {
                    var queryStr;
                    if (params) { //构造query
                        var queryArr = [];
                        $.each(params, function (key, value) {
                            queryArr.push([key, value].join('='));
                        });
                        queryStr = queryArr.join('!!');
                        path += path.indexOf('?') >= 0 ? queryStr : '?' + queryStr;
                    }
                    router.route(path);
                }
                var target = e.currentTarget,
                    info = target.dataset.info.split(':');
                route('category/' + info[0], {name: info[1]});
            }
        },
        listeners: {
            'beforetmpl': function(evt, data) {
                data.info = data.id + ':' + data.name;
            },
            'afterrender': function () {
                var $el = this.$el;
                Util.loadAppIcon($el.attr('data-icon'), $el.find('.icn'));
            }
        }
    });
    return Category;
});
