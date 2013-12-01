define(function(require, exports) {
    'use strict';
    var $ = require('core/selector'),
        api = null,
        util = require('util'),
        useJsonp = false,
        /* --- START OF CONST --- */
        UC_PARAM_STR = 'pfnieisivecpmibifrdnla',
        /* --- END OF CONST --- */
        simulator;

    /**
     * Ajax请求函数
     * @param  {Object} option
     * @return
     */
    function ajax(option) {
        var url = option.url,
            type = option.type,
            success = option.success || function () {},
            error = option.error || function () {},
            dataType = option.dataType || 'json',
            timeout = (option.timeout || 20) * 1000;
        if (url.indexOf('uc_param_str') < 0) {
            url += (url.indexOf('?') < 0 ? '?' : '&') + 'uc_param_str=' + UC_PARAM_STR;
        }
        $.ajax({
            dataType: dataType,
            type: type,
            timeout: timeout,
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
    }

    exports.ping = function (apiName, params) {
        var img = new Image(),
            url = api[apiName];
        if (url) {
            params = params || {};
            params.uc_param_str = UC_PARAM_STR;
            img.src = util.param(params, url);
        }
    };

    /**
     * 获取Api地址
     * @param {String} apiName api名称
     * @return {String/Null} api地址
     */
    exports.getApi = function (apiName) {
        return api[apiName] || null;
    };

    /**
     * 发起请求
     * @param  {String} path    路由path
     * @param  {params} params  参数
     * @param  {Function} success 成功回调
     * @param  {Function} error   失败回调
     */
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
            success: success,
            error: error
        });
    };
    /**
     * 初始化数据层
     * @param  {String} _api        用户Api配置
     * @param  {Boolean} jsonp      是否使用jsonp
     * @param  {Object} _simulator  模拟器，用于模拟浏览器参数
     */
    exports.init = function init(_api, jsonp, _simulator) {
        if (!_api) {
            throw new Error('[Model] init without api config');
        }
        api = _api;
        useJsonp = jsonp;
        simulator = _simulator;//dev code
    };
});