/*!
 * Com v@VERSION
 * component JavaScript Library
 * https://github.com/zhangmhao/component
 *
 * Copyright 2013
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function (global, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['exports'], function(exports) {
            // others that may still expect a global Backbone.
            global.Com = factory(global, exports);
        });
    } else if (typeof define === 'function') {
        define(function(require, exports, module) {
            module.exports = global.Com = factory(global, exports);
        });
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        //兼容CommonJS and CommonJS-like环境
        //此处参考jquery的做法
        //var _ = require('underscore'), $;
        ///try { $ = require('zepto'); } catch(e) {}
        factory(global, module.exports);
    } else {
        global.Com = factory(global, {}, (global.jQuery || global.Zepto || global.ender || global.$), global._);
    }

// Pass this, window may not be defined yet
}(this, function (window, Com) {
    'use strict';
