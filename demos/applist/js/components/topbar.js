/**
 * [Component] 顶部导航条
 */
define(function (require, exports) {
    'use strict';
    var Component = require('lib/com'),
        Button = require('components/button'),
        _ = require('core/lang'),
        TopBar;

    TopBar = Component.extend({
        type: 'topBar',
        tpl: '#tpl-bar-top',
        getState: function () {
            return {
                name: this.env.queries.name
            };
        },
        components: [{
            _constructor_: Button,
            id: 'back',
            selector: '.b-btn-back'
        }],
        update: function (state) {
            this.setTitle(state.queries.name);
        },
        init: function (option) {
            this._super(option);
            this.setTitle(this.env.queries.name);
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
