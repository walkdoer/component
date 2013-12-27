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

    if (typeof module === "object" && typeof module.exports === "object") {
        //兼容CommonJS and CommonJS-like环境
        //此处参考jquery的做法
        module.exports = global.document ?
            factory(global, true) :
            function(w) {
                if (!w.document) {
                    throw new Error("Com requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }

// Pass this, window may not be defined yet
}(this, function (window, noGlobal) {
    'use strict';