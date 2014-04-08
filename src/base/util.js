/**
 * 工具类
 */
define(function(require, exports, module) {

    var util = {};

    util.error = function (functionName, msg) {
        return new Error([
            //错误前缀
            '[Com Error]',
            !functionName ? '' :
            'function <' + functionName + '> has an Error:',
            msg
        ].join(''));
    };
    return util;
});
