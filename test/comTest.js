/**
 * Com Unit Test
 */
define(function (require) {

    var Com = require('./com');
    QUnit.module("com");

    QUnit.test("com Api test", function () {

        var newName = 'andrew';
        var counter = 1;

        var app = new Com({
            id: 'application',
            tplContent: '<div><p class="title"><%_state_.name%></p></div>',
            parentEl: document.body,
            getState: function () {
                return {
                    name: 'application' + counter++
                };
            },
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
        QUnit.equal(app.el.innerHTML, '<p class="title">application1</p>', "元素HTML正常");
        app.appendToParent();
        QUnit.equal(document.getElementById('application'),
            app.el,
            'API appendToParent() 正常');

        var List = Com.extend({
            type: 'list',
            append: function (item) {
                this.appendChild(item);
            }
        }), Li = Com.extend({
            type: 'li'
        });
        var list = new List({
            tplContent: '<ul></ul>'
        });

        var index = 5;
        while (index-- > 0) {
            list.append(new Li({
                tplContent: '<li>item' + index + '</li>'
            }));
        }
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
                            true, 'uiEvent 函数回调 正常');
                        location.hash = newName;
                    }
                }
            }, {
                _constructor_: Com,
                id: 'about',
                tplContent: '<button>about me</button>',
                uiEvents: {
                    'click' : 'aboutMe'
                },
                aboutMe: function (e, btn) {
                    btn.parentNode.trigger('aboutme');
                    QUnit.ok(true, 'uiEvent 字符串回调方式 正常');
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
        app.appendChild([topBar, list]);
        QUnit.equal(app.firstChild === topBar && app.childCount === 2, true, 'API appendChild() 正常');
        QUnit.equal(topBar.el.id, topBar.id, 'ID属性正常');
        QUnit.equal(topBar.el.className, 'name', 'API getState()正常');
        app.render();

        QUnit.stop();
        window.onhashchange = function () {
            QUnit.ok(topBar.needUpdate() === true && app.needUpdate() === true, 'API needUpdate() 正常');
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
