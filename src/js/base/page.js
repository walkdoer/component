/**
 * 组件类
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Page;
    Page = Component.extend({
        type: 'page',
        /**
         * 设置下一页
         * @param {String} nextPage
         */
        setNextPage: function (nextPage) {
            this.nextPage = nextPage;
        },
        /**
         * 设置上一页
         * @param {String} prevPage
         */
        setPrevPage: function (prevPage) {
            this.prevPage = prevPage;
        }
    });

    return Page;
});