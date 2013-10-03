define(function(require, exports) {
    'use strict';
    var data = {
        index: {
            navigator: {
                title: '沿途'
            },
            list: {
                totalCount: 10,
                data: [{
                    title: '今天进去了阿里，看了寺庙',
                    content: '美丽的雪山，一望无际的荒漠，无人区上奔跑的藏羚羊'
                }, {
                    title: '今天进去了阿里，看了寺庙',
                    content: '美丽的雪山，一望无际的荒漠，无人区上奔跑的藏羚羊'
                }]
            }
        }
    };
    exports.getData = function getData(api, callback) {
        var delayTime = Math.round(Math.random() * 300),
            timer;
        console.log('获取' + api + '数据delay:' + delayTime);
        timer = setTimeout(function () {
            callback(data[api]);
            clearTimeout(timer);
        }, delayTime);
    };
});