define(function (require) {

    var tpl = require("./template");

    QUnit.module("base/template");

    QUnit.test("template test", function () {

        var tplContent = '<div class="name"><%firstName%></div><div class="fullname"><%fullname%></div>',
            data = {
                firstName: 'andrew',
                lastName: 'zhang',
                fullname: function () {
                    return this.firstName + ' ' + this.lastName;
                }
            };
        var expect = '<div class="name">andrew</div><div class="fullname">andrew zhang</div>';
        QUnit.equal(tpl.tmpl(tplContent, data), expect, '模板编译结果与预期一致');
    });

});
