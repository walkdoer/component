define(function(require, exports) {
    'use strict';
    var pageMgr = require('page/pageMgr'),
        changePage;
    changePage = function (pageName, data) {
        pageMgr.changePage(pageName, data);
    };
    exports.changePage = changePage;
});