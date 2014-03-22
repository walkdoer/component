define(function (require) {

    var Node = require("./node");

    // Define the QUnit module and lifecycle.
    QUnit.module("base/node");

    QUnit.test("Node api and property test", function () {
        var node1 = new Node({
            id: 'node_id_1'
        });
        var node2 = new Node();
        var node3 = new Node({
            id: 'node_id_3'
        });
        var node4 = new Node();

        node1.appendChild(node2);

        node2.appendChild(node3);
        node2.appendChild(node4);

        //test api getChildById
        var result = node2.getChildById('node_id_3');
        QUnit.equal(node3 === result, true, 'getChildById API 正常');

        //test property nextNode and prevNode
        QUnit.equal(node2.firstChild === node3, true, 'firstChild API 正常');
        QUnit.equal(node2.lastChild === node4, true, 'lastChild API 正常');
        QUnit.equal(node3.nextNode === node4, true, 'nextNode API 正常');
        QUnit.equal(node4.prevNode === node3, true, 'prevNode API 正常');

        //test api appendChild
        QUnit.equal(node1.nodeCount, 1);
        QUnit.equal(node2.nodeCount, 2);

        //test api removeChild
        node1.removeChild(node1);
        QUnit.equal(node1.nodeCount, 0, 'removeChild API 正常');

        //test api removeAllChild
        node2.removeAllChild();
        QUnit.equal(node2.nodeCount, 0, 'removeAllChild API 正常');

    });

    QUnit.test('Node Event', function () {
        var adder = new Node({
            id: 'adder'
        });
        adder.on('add', function (a, b, c) {
            console.log('node1 event fire', a, b, c);
            QUnit.equal(a + b + c, 6, '.on("event", callbakc)形式：事件回调调用正常');
        }).on({
            sub: function (a, b) {
                QUnit.equal(a - b, 2, '.on({event1: foo, event2: bar})形式：事件回调调用正常');
            },
            increase: function (a) {
                QUnit.equal(a + 1, 3,  '.on({event1: foo, event2: bar})形式：事件回调调用正常');
            }
        });
        adder.trigger('add', 1, 2, 3);
        adder.trigger('sub', 6, 4);
        adder.trigger('increase', 2);

        var View = new Node(),
            Model = new Node(),
            Router = new Node();

        var functionCallCounter = {
            onModelChange: 0,
            Router: 0
        };
        var onModelChange = function (data) {
            functionCallCounter.onModelChange++;
            QUnit.equal(data, 'model data', 'listenTo API 正常');
        };

        View.listenTo(Router, 'change', function (params) {
            functionCallCounter.Router++;
            QUnit.equal(params, 'router params', 'listenTo API 正常');
        }).listenTo(Model, {
            'change': onModelChange,
            'delete': function (data) {
                QUnit.equal(data, 'model delete', 'listenTo API 正常');
            }
        });

        Model.trigger('change', 'model data');
        Model.trigger('delete', 'model delete');
        Router.trigger('change', 'router params');

        View.stopListening(Router);
        Router.trigger('change', 'router params');
        View.stopListening(Model, 'change', onModelChange);
        Model.trigger('delete', 'model delete');
        QUnit.equal(functionCallCounter.onModelChange, 1, 'stopListening API 正常');
        QUnit.equal(functionCallCounter.Router, 1, 'stopListening API 正常');
    });

});
