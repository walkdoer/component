/*
 * 自定义Error类
 */
define(function (require, exports) {
    'use strict';
    function UserError(code, message) {
        this.code = code;
        this.message = message;
    }
    UserError.prototype = new Error();
    UserError.prototype.constructor = UserError;
    return UserError;
});