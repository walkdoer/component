define(function (require) {

	// Import depdendencies (note you can use relative paths here)
	var Class = require("./class");

	// Define the QUnit module and lifecycle.
	QUnit.module("base/class");

	QUnit.test("Base method call", function () {
        var ClassA = Class.extend({
            foo: function () {
                return 'ClassA foo';
            },
            bar: function () {
                return 'ClassA bar';
            }
        });
        var a = new ClassA();
		QUnit.equal(a.foo(), 'ClassA foo');
	});

});
