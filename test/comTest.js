/**
 * Com Unit Test
 */
define(function (require) {

    var Com = require('./com');
    QUnit.module("com");

    QUnit.test("com Api test", function () {

        var newName = 'andrew';

        var app = new Com({
            id: 'application',
            tplContent: '<div><p class="title">test</p></div>',
            parentEl: document.body
        });

        app.render();
        QUnit.equal(app.el.innerHTML, '<p class="title">test</p>', "元素HTML正常");
        app.appendToParent();
        QUnit.equal(document.getElementById('application'),
            app.el,
            'API appendToParent() 正常');

        var topBar = new Com({
            id: 'topbar',
            tplContent: '<nav class="<%_state_.name%>"><%title%><button class="home">home</button></nav>',
            components: [{
                _constructor_: Com,
                id: 'go-back-home',
                selector: '.home',
                uiEvents: {
                    'click': function (e, btn) {
                        var target = e.currentTarget;
                        QUnit.ok(btn.id === target.id, '属性selector正常');
                        QUnit.equal(target === btn.el &&
                            target.id === btn.id,
                            true, '事件机制正常');
                        location.hash = newName;
                    }
                }
            }],
            getState: function () {
                return {
                    name: location.hash.slice(1) || 'name'
                };
            }
        });
        app.appendChild(topBar);
        QUnit.equal(topBar.el.id, topBar.id, 'ID属性正常');
        QUnit.equal(topBar.el.className, 'name', 'API getState()正常');
        app.render();

        window.onhashchange = function () {
            app.update();
            QUnit.equal(topBar.el.className, newName, 'API getState()正常');
        };
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initEvent('click', true, true);
        document.getElementById('go-back-home').dispatchEvent(clickEvent);
    });

});
