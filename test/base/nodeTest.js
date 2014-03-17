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
        QUnit.equal(node3 === result, true);

        //test property nextNode and prevNode
        QUnit.equal(node2.firstChild === node3, true);
        QUnit.equal(node2.lastChild === node4, true);
        QUnit.equal(node3.nextNode === node4, true);
        QUnit.equal(node4.prevNode === node3, true);

        //test api appendChild
        QUnit.equal(node1.nodeCount, 1);
        QUnit.equal(node2.nodeCount, 2);

        //test api removeChild
        node1.removeChild(node1);
        QUnit.equal(node1.nodeCount, 0);

        //test api removeAllChild
        node2.removeAllChild();
        QUnit.equal(node2.nodeCount, 0);

    });

});
