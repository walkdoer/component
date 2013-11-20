/**
 * [Component] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('base/component'),
        Button = require('components/button'),
        _ = require('core/lang'),
        TopBar;

    TopBar = Component.extend({
        type: 'topBar',
        tpl: '#tpl-bar-top',
        state: ['queries.name'],
        components: [{
            _constructor_: Button,
            option: {
                id: 'back',
                selector: '.b-btn-back'
            }
        }],
        update: function (state) {
            this.setTitle(state.queries.name);
        },
        init: function (option) {
            this._super(option);
            this.setTitle(this.queries.name);
        },
        setTitle: function (title) {
            this.$el.find('.b-title').html(_.escapeHTML(title));
        },
        listeners: {
            'button:back:click': function () {
                history.back();
            }
        }
    });
    return TopBar;
});