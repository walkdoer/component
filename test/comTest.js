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


    /**
     * 测试Com的一些细节
     */
    QUnit.test('com detail test', function () {
        var aContent = 'a test';
        var a = new Com({
            tplContent: aContent
        });

        var b = new Com({
            tpl: '#tpl-test'
        });

        var c = new Com({
            tpl: '#tpl-test',
            tplContent: 'c test'
        });

        a.render();
        b.render();
        c.render();

        QUnit.ok(a.el.innerHTML === aContent && c.el.innerHTML === 'c test', 'tplContent配置项 正常');
        QUnit.ok(b.el.innerHTML.trim() === 'this is a test', 'tpl配置项 正常');

    });

    QUnit.test("com Api test", function () {

        var newName = 'andrew';
        var counter = 1;

        var app = new Com({
            id: 'application',
            components: [{
                _constructor_: Com,
                id: 'app-title',
                tplContent: '<%_state_.name%>',
                getState: function () {
                    return {
                        name: 'application' + counter++
                    };
                }
            }],
            parentEl: document.body,
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
        QUnit.equal(app.el.innerHTML, '<div id="app-title">application1</div>', "元素HTML正常");
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
        var Button = Com.extend({
            type: 'button',
            tagName: 'button'
        });

        var topBar = new Com({
            id: 'topbar',
            components: [{
                _constructor_: Com,
                id: 'go-back-home',
                //验证多余1层的components配置是否会出现问题
                components: [{
                    _constructor_: Button,
                    id: 'test-component',
                    tplContent: 'test component <% _state_.name %>',
                    getState: function () {
                        return {
                            name: location.hash.slice(1) || 'name'
                        };
                    }
                }, {
                    _constructor_: Button,
                    id: 'test-button-2',
                    tplContent: 'test button 2'
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
                _constructor_: Button,
                id: 'about',
                tplContent: 'about me',
                uiEvents: {
                    'click' : 'aboutMe'
                },
                aboutMe: function () {
                    this.parentNode.trigger('aboutme');
                    QUnit.ok(true, 'uiEvent 字符串回调方式 正常');
                }
            }],
            data: {
                title: 'andrew\'s homepage'
            }
        });

        QUnit.deepEqual(topBar.getData(), {
            _id_: 'topbar',
            _state_: null,
            title: 'andrew\'s homepage'
        }, 'API getData() 正常');
        app.appendChild([topBar, list, autoListA]);
        var index = 5;
        while (index-- > 0) {
            list.append(new Li().html('item' + index));
            autoListA.append(new Li().html('item' + index));
        }

        /**
         * 检查 appendChild接口是不是工作正常
         * 检查方法: 通过检查组件是否符合预期，且组件的个数是不是正常
         */
        QUnit.equal(app.firstChild.nextNode === topBar && app.childCount === 4, true, 'API appendChild() 正常');

        /**
         * 检查ID属性是否正常
         */
        QUnit.equal(topBar.el.id, topBar.id, 'ID属性正常');

        app.render();

        QUnit.deepEqual(topBar.getChildById('test-component').getState(), {name: 'name'}, 'API getState()正常');
        QUnit.equal(topBar.el.innerHTML, '<div id="go-back-home"><button id="test-component">test component name</button><button id="test-button-2">test button 2</button></div><button id="about">about me</button>', 'tmpl接口正常');
        QUnit.equal(topBar.el.innerHTML, '<div id="go-back-home"><button id="test-component">test component name</button><button id="test-button-2">test button 2</button></div><button id="about">about me</button>', '渲染符合预期');
        QUnit.equal(topBar.getChildById('test-component').el, document.getElementById('test-component'), '多层级Component嵌套正常');
        QUnit.stop();
        window.onhashchange = function () {
            var appTitle = app.getChildById('app-title');
            var testCom = topBar.getChildById('test-component');
            QUnit.ok(testCom.needUpdate() === true && appTitle.needUpdate() === true && topBar.needUpdate() === false, 'API needUpdate() 正常');
            app.update();
            QUnit.equal(topBar.getChildById('test-component').el.innerHTML, 'test component ' + newName, 'API Update() 正常');
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
