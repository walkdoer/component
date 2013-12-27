/*!
 * Com v0.1.1
 * component JavaScript Library
 * https://github.com/zhangmhao/component
 *
 * Copyright 2013
 * Released under the MIT license
 *
 * Date: 2013-12-27T16:52Z
 */

(function (global, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'zepto', 'exports'], function(_, $, exports) {
            // others that may still expect a global Backbone.
            global.Com = factory(global, exports, $, _);
        });
    } else if (typeof module === "object" && typeof module.exports === "object") {
        //兼容CommonJS and CommonJS-like环境
        //此处参考jquery的做法
        var _ = require('underscore'), $;
        try { $ = require('zepto'); } catch(e) {};
        factory(global, exports, $, _);
    } else {
        global.Com = factory(global, {}, (global.jQuery || global.Zepto || global.ender || global.$), global._);
    }

// Pass this, window may not be defined yet
}(this, function (window, Com, $, _) {
    
require.config({
    baseUrl: 'libs',
    paths: {
        // the left side is the module ID,
        // the right side is the path to
        // the jQuery file, relative to baseUrl.
        // Also, the path should NOT include
        // the '.js' file extension. This example
        // is using jQuery 1.9.0 located at
        // js/lib/jquery-1.9.0.js, relative to
        // the HTML page.
        zepto: 'zepto.js'
    }
})
.define([
    'base/node.display'
], function (Com) {
    
    return Com;
});
define("com", function(){});
}));
