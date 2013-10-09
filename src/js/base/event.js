/**
 * 事件定义
 */
define(function (require, exports) {
    'use strict';
    var events = {
            BEFORE_RENDER: 'beforerender',
            AFTER_RENDER: 'afterrender',
            RENDERED: 'rendered'
        },
        Event = function () {};
    Event.add = function (key, value) {
        events[key] = value;
    };
    Event.get = function (key) {
        var event = events[key],
            args = Array.prototype.slice.call(arguments, 1),
            itm;
        if (!event) {
            //如果不是自定义事件，直接返回
            return key;
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
    return Event;
});