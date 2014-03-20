/**
 * 组件序列号生成器
 */
define(function () {
    return {
        id: 1e9,
        /**
         * 生成序列号
         * @return {String} 16进制字符串
         */
        gen: function (prefix) {
            return (prefix || '') + (this.id++).toString(16);
        }
    };
});
