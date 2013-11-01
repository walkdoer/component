define(function(require, exports) {
    'use strict';
    var $ = require('zepto'),
        api = null,
        callbackReflect = {},
        useJsonp = false,
        simulator,// dev code
        ajax;
    ajax = function ajax(option) {
        var url = option.url,
            type = option.type,
            success = option.success || function () {},
            error = option.error || function () {},
            dataType = option.dataType || 'json',
            timeout = (option.timeout || 20) * 1000;
        if (url.indexOf('uc_param_str') < 0) {
            url += (url.indexOf('?') < 0 ? '?' : '&') + 'uc_param_str=pfnieisivecpmibifrdnla';
        }
        $.ajax({
            dataType: dataType,
            type: type,
            timeout: timeout, // 秒
            url: url,
            data: option.params,
            success: function (data) {
                if (data.success) {
                    success(data);
                } else {
                    error(data);
                }
            },
            error: function (err) {
                error(err);
            }
        });
    };
    exports.get = function get(path, params, success, error) {
        console.log('发送数据请求');
        if (api === null) {
            throw new Error('[Model] you may not initial model layer');
        }
        var url = api[path];
        if (!url) {
            throw new Error('[Model] no api for ' + path);
        }
        if (simulator) {//dev code
            params = $.extend({}, params, simulator);
        }
        ajax({
            url: url,
            type: 'GET',
            dataType: useJsonp ? 'jsonp' : 'json',
            params: params,
            success: function () {
                var args = Array.prototype.slice.call(arguments, 0);
                setTimeout(function () {
                    success.apply(null, args);
                }, 300);
            },
            error: error
        });
    };
    exports.setReflect = function (path, callback) {
        callbackReflect[path] = callback;
    };
    exports.init = function init(_api, jsonp, _simulator) {
        if (!_api) {
            throw new Error('[Model] init without api config');
        }
        api = _api;
        useJsonp = jsonp;
        simulator = _simulator;//dev code
    };
});