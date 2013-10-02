define(function(require, exports) {
    'use strict';
    var $ = require('core/selector'),
        Display = require('base/display');

    var test = new Display({
        container: $('#main')
    });
    console.log('test', test);
});