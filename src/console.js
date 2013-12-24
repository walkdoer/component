define(function (require, exports) {
    'use strict';
        outPutComponentStatus;
        for (var pgName in pages) {
            if (pages.hasOwnProperty(pgName)) {
                var pg = pages[pgName];
                console.debug(pg.type + '-' + pg.name + ' rendered: ' + pg.rendered);
                outPutComponentStatus(pg);
            }
        }
    };
    outPutComponentStatus = function (pg) {
        var components = pg.getComponent(),
            cp;
        for (var i = 0; i < components.length; i++) {
            cp = components[i];
            console.debug('  |____' + cp.type + cp.name + ' rendered: ' + cp.rendered);
        }
    };

    exports.outPutPageStatus = outPutPageStatus;
});
