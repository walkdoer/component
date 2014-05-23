/**
 * Com Unit Test
 */
define(function (require) {

    var Com = require('./com');
    QUnit.module("com");

    //使用 $ (Zepto or JQuery)对Com进行强化
    Com.config({
        enhancer: $
    });

    QUnit.test('com config test', function () {
        //对强化函数进行验证
        ['show', 'hide', 'toggle', 'empty', 'html'].forEach(function(method) {
            QUnit.ok(typeof Com.prototype[method] === 'function', '强化函数' + method + ' 正常');
        });
    });

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
                },
                'list:auto-list-a:beforeappend': function () {
                    QUnit.ok(false, '多继承事件监听不正常');
                },
                'autolist:auto-list-a:beforeappend': function (evt, list, items) {
                    QUnit.ok(true, '多继承事件监听正常');
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
                this.trigger('beforeappend', this, item);
                this.appendChild(item);
            }
        }), AutoList = List.extend({
            type: 'autolist',
        }), Li = Com.extend({
            type: 'li',
            tagName: 'li'
        });
        var list = new List({
            tplContent: '<ul></ul>'
        });
        var autoListA = new AutoList({
            id: 'auto-list-a',
            tplContent: '<ul></ul>'
        });

        var topBar = new Com({
            id: 'topbar',
            tplContent: '<nav class="<%_state_.name%>"><%title%><button class="home">home</button></nav>',
            components: [{
                _constructor_: Com,
                id: 'go-back-home',
                selector: '.home',
                //验证多余1层的components配置是否会出现问题
                components: [{
                    _constructor_: Com,
                    id: 'test-component'
                }],
                uiEvents: {
                    'click': function (e) {
                        var target = e.currentTarget;
                        QUnit.ok(this.id === target.id, '属性selector正常');
                        QUnit.equal(target === this.el &&
                            target.id === this.id,
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
                aboutMe: function () {
                    this.parentNode.trigger('aboutme');
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
        app.appendChild([topBar, list, autoListA]);
        var index = 5;
        while (index-- > 0) {
            list.append(new Li().html('item' + index));
            autoListA.append(new Li().html('item' + index));
        }
        QUnit.equal(app.firstChild === topBar && app.childCount === 3, true, 'API appendChild() 正常');
        QUnit.equal(topBar.el.id, topBar.id, 'ID属性正常');
        QUnit.equal(topBar.el.className, 'name', 'API getState()正常');
        app.render();
        QUnit.equal(topBar.el.innerHTML, 'andrew\'s homepage<button class="home" id="go-back-home">home<div id="test-component"></div></button><button id="about">about me</button>', '渲染符合预期');
        QUnit.equal(topBar.getChildById('test-component').el, document.getElementById('test-component'), '多层级Component嵌套正常');
        QUnit.stop();
        window.onhashchange = function () {
            QUnit.ok(topBar.needUpdate() === true && app.needUpdate() === true, 'API needUpdate() 正常');
            app.update();
            QUnit.equal(topBar.el.className, newName, 'API Update() 正常');
            var clickEvent = document.createEvent('MouseEvents');
            clickEvent.initEvent('click', true, true);
            document.getElementById('go-back-home').dispatchEvent(clickEvent);

            QUnit.start();
        };
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initEvent('click', true, true);
        document.getElementById('go-back-home').dispatchEvent(clickEvent);
        document.getElementById('about').dispatchEvent(clickEvent);
    });

});
