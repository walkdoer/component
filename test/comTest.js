/**
 * Com Unit Test
 */
define(function (require) {

    var Com = require('./com');
    QUnit.module("com");

    QUnit.test("com Api test", function () {

        var App = new Com({
            id: 'application',
            parentEl: document.body
        });

        App.render().appendToParent();
    });

});
