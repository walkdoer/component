/**
 * 日志
 */
define(function(require, exports) {
    'use strict';
    var model = require('model'),
        extractPath = function (path) {
            var pathArray = path.split('/'),
                logInfoStr;
            //去除根节点和自身节点信息，因为统计日志不关注这个信息，能省则省
            pathArray.splice(0, 2);
            pathArray.pop();
            logInfoStr = pathArray.join('/');
            return logInfoStr;
        };
    var log = function (data) {
        var path = data.path;
        if (path) {
            data.p = extractPath(data.path);
            delete data.path;
        }
        model.ping('log', data);
    };
    exports.log = log;
    var ajaxLogWithApi = function (apiName, data, success, error){
    	var path = data.path;
        if (path) {
            data.p = extractPath(data.path);
            delete data.path;
        }
        model.ajaxPing(apiName, data, success, error);
    };
    exports.ajaxLogWithApi = ajaxLogWithApi;
});