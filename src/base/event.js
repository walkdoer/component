/**
 * 事件定义
 */
define(function (require, exports) {
    'use strict';
    var $ = require('core/selector'),
        events = {
            BEFORE_RENDER: 'before:render',
            AFTER_RENDER: 'after:render',
            RENDERED: 'rendered'
        },
        Event = function () {};
    Event.register = function (key, value) {
        events[key] = value;
    };
    Event.add = function (type, userEvents) {
        $.each(userEvents, function (evtCode, evtName) {
            if (events[evtCode]) {
                throw new Error('[Model] Event Code:' + evtCode + 'is Already in pre-definded event list');
            }
            evtCode = [type, evtCode].join('_');
            Event.register(evtCode, evtName);
        });
    };
    Event.get = function (type, evtCode) {
        var event = events[evtCode] || events[[type, evtCode].join('_')],
            args = Array.prototype.slice.call(arguments, 2),
            itm;
        if (!event) {
            return null;
        }
        for (var i = 0, len = args.length; i < len; i++) {
            itm = args[i];
            if (!itm || typeof args[i] !== 'string') {
                args.splice(i, 1);
            }
        }
        args.push(event);
        return args.join(':');
    };
    /**
     * Events
     * 通过Mix的方式为其他对象提供事件机制
     * @example
     *     var obj = {};
     *     _.extend(obj, Events);
     *     object.on('run_forrest_gump', function() {
     *         console.log('forrest gump start running...')
     *     });
     *     object.trigger('run_forrest_gump')
     * @type {Object}
     */
    var Events = {
        on: function() {

        },
        off: function () {

        }
    };
    return Event;
});