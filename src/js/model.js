define(function(require, exports) {
    'use strict';
    var data = {
        index: {
            navigator: {
                title: '沿途',
                button: {
                    title: '栏目'
                },
                menu: [{
                    title: '国外', 
                    url: 'italy'
                }, {
                    title: '国内', 
                    url: 'italy'
                }, {
                    title: '间隔年', 
                    url: 'italy'
                }]
            },
            list: {
                totalCount: 10,
                data: [{
                    title: '今天进去了阿里，看了寺庙',
                    thumb: 'images/index-1.jpg',
                    content: '美丽的雪山，一望无际的荒漠，无人区上奔跑的藏羚羊'
                }, {
                    title: '骑车去西藏！不要告诉我妈妈',
                    thumb: 'images/index-2.jpg',
                    content: '年轻无极限，每个人都有一个骑行梦。美丽的雪山，一望无际的荒漠，无人区上奔跑的藏羚羊'
                }, {
                    title: '今天进去了阿里，看了寺庙',
                    thumb: 'images/index-3.jpg',
                    content: '美丽的雪山，一望无际的荒漠，无人区上奔跑的藏羚羊'
                }, {
                    title: '今天进去了阿里，看了寺庙',
                    thumb: 'images/index-4.jpg',
                    content: '美丽的雪山，一望无际的荒漠，无人区上奔跑的藏羚羊'
                }, {
                    title: '今天进去了阿里，看了寺庙',
                    thumb: 'images/index-5.jpg',
                    content: '美丽的雪山，一望无际的荒漠，无人区上奔跑的藏羚羊'
                }, {
                    title: '今天进去了阿里，看了寺庙',
                    thumb: 'images/index-6.jpg',
                    content: '美丽的雪山，一望无际的荒漠，无人区上奔跑的藏羚羊'
                }, {
                    title: '今天进去了阿里，看了寺庙',
                    thumb: 'images/index-7.jpg',
                    content: '美丽的雪山，一望无际的荒漠，无人区上奔跑的藏羚羊'
                }]
            }
        }
    };
    exports.getData = function getData(api, callback) {
        var delayTime = Math.round(Math.random() * 300),
            timer;
        //console.log('获取' + api + '数据delay:' + delayTime);
        timer = setTimeout(function () {
            callback(data[api]);
            clearTimeout(timer);
        }, delayTime);
    };
});