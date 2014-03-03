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

        var ClassB = ClassA.extend({
            foo: function () {
                return 'ClassB foo';
            },
            bar: function () {
                return 'ClassB bar and ' + this._super();
            }
        });
        var a = new ClassA(),
            b = new ClassB();
		QUnit.equal(a.foo(), 'ClassA foo');
        QUnit.equal(a.bar(), 'ClassA bar');

        QUnit.equal(b.foo(), 'ClassB foo');
        QUnit.equal(b.bar(), 'ClassB bar and ClassA bar');
	});

});
