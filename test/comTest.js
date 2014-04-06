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
            parentEl: document.body,
            listeners: {
                'display:topbar:statechange': 'change',
                'display:topbar:aboutme': function () {
                    console.log('about me');
                    QUnit.ok(true, 'listeners 函数回调方式 正常');
                }
            },
            change: function (state) {
                console.log(state);
                QUnit.ok(true, 'listeners 字符串函数名回调方式 正常');
            }
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
            }, {
                _constructor_: Com,
                id: 'about',
                tplContent: '<button>about me</button>',
                uiEvents: {
                    'click' : function (e, btn) {
                        btn.parentNode.trigger('aboutme');
                    }
                }
            }],
            getState: function () {
                return {
                    name: location.hash.slice(1) || 'name'
                };
            },
            data: {
                title: 'andrew\'s homepage'
            }
        });

        QUnit.deepEqual(topBar.getData(), {
            _id_: 'topbar',
            _state_: {
                name: 'name'
            },
            title: 'andrew\'s homepage'
        }, 'API getData() 正常');
        QUnit.equal(topBar.el.innerHTML, 'andrew\'s homepage<button class="home" id="go-back-home">home</button>', 'tmpl接口正常');
        app.appendChild(topBar);
        QUnit.equal(app.firstChild === topBar && app.childCount === 1, true, 'API appendChild() 正常');
        QUnit.equal(topBar.el.id, topBar.id, 'ID属性正常');
        QUnit.equal(topBar.el.className, 'name', 'API getState()正常');
        app.render();

        QUnit.stop();
        window.onhashchange = function () {
            QUnit.ok(topBar.needUpdate() === true && app.needUpdate() === false, 'API needUpdate() 正常');
            app.update();
            QUnit.equal(topBar.el.className, newName, 'API Update() 正常');
            QUnit.start();
        };
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initEvent('click', true, true);
        document.getElementById('go-back-home').dispatchEvent(clickEvent);
        document.getElementById('about').dispatchEvent(clickEvent);
    });

});
