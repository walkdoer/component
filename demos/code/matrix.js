(function (window, undefined) {
    'use strict';
    var matrix = [],
        rowSize = 8,
        colSize = 8,
        rowArr;

    //创建 rowSize * colSize 的矩阵
    for(var i = 0; i < rowSize; i++) {
        //二维数组模拟矩阵
        matrix[i] = rowArr = [];
        //列
        for(var j = 0; j < colSize; j++) {
            var com = new Com({
                tplContent: '<div class="cell" style="background:<%_state_.color%>"></div>',
                row: i,
                col: j,
                color: 16777215, //默认为白色 #FFFFFF
                id: 'm_' + i + '_' + j,
                parentEl: window.document.body,
                getState: function() {
                    return {
                        color: '#' + this.color.toString(16)
                    };
                }
            });
            com.render().appendToParent();
            rowArr.push(com);
        }
    }
    var comTop, comRight, comBottom, comLeft;
    //矩阵节点联接
    for(var row = 0; row < rowSize; row++) {
        rowArr = matrix[row];
        for(var col = 0; col < colSize; col++) {
            var com = rowArr[col];
            //先处理矩阵的主体，减少if判断次数
            if ( row > 0 && row < rowSize - 1 && col > 0 && col < colSize -1) {
                //矩阵主体为4联通节点  T R B L
                comTop = matrix[row - 1][col];
                comRight = rowArr[col + 1];
                comLeft = rowArr[col - 1];
                comBottom = matrix[row + 1][col];
                com.listenTo(comTop, 'colorchange', onColorChange)
                    .listenTo(comRight, 'colorchange', onColorChange)
                    .listenTo(comBottom, 'colorchange', onColorChange)
                    .listenTo(comLeft, 'colorchange', onColorChange);
            } else if (row === 0 && col > 0 && col < colSize - 1) {
                //上边缘联通方向, R B L

                comRight = rowArr[col + 1];
                comLeft = rowArr[col - 1];
                comBottom = matrix[row + 1][col];
                com.listenTo(comRight, 'colorchange', onColorChange)
                    .listenTo(comBottom, 'colorchange', onColorChange)
                    .listenTo(comLeft, 'colorchange', onColorChange);
            } else if (row === rowSize - 1 && col > 0 && col < colSize - 1) {
                //下边缘联通方向 T L R
                comTop = matrix[row - 1][col];
                comRight = rowArr[col + 1];
                comLeft = rowArr[col - 1];
                com.listenTo(comTop, 'colorchange', onColorChange)
                    .listenTo(comRight, 'colorchange', onColorChange)
                    .listenTo(comLeft, 'colorchange', onColorChange);
            } else if (col === 0 && row > 0 && row < rowSize - 1) {
                //左边缘联通方向 T R B
                comTop = matrix[row - 1][col];
                comRight = rowArr[col + 1];
                comBottom = matrix[row + 1][col];
                com.listenTo(comTop, 'colorchange', onColorChange)
                    .listenTo(comRight, 'colorchange', onColorChange)
                    .listenTo(comBottom, 'colorchange', onColorChange);
            } else if (col === colSize - 1 && row > 0 && row < rowSize - 1) {
                //右边缘联通方向 T B L
                comTop = matrix[row - 1][col];
                comLeft = rowArr[col - 1];
                comBottom = matrix[row + 1][col];
                com.listenTo(comTop, 'colorchange', onColorChange)
                    .listenTo(comBottom, 'colorchange', onColorChange)
                    .listenTo(comLeft, 'colorchange', onColorChange);
            } else if (col === 0 && row === 0) {
                //左上角 R B
                comRight = rowArr[col + 1];
                comBottom = matrix[row + 1][col];
                com.listenTo(comRight, 'colorchange', onColorChange)
                    .listenTo(comBottom, 'colorchange', onColorChange);
            } else if (col === colSize && row === 0) {
                //右上角 B L
                comLeft = rowArr[col - 1];
                comBottom = matrix[row + 1][col];
                com.listenTo(comBottom, 'colorchange', onColorChange)
                    .listenTo(comLeft, 'colorchange', onColorChange);
            } else if (col === colSize && row === rowSize) {
                //右下角 T L
                comTop = matrix[row - 1][col];
                comLeft = rowArr[col - 1];
                com.listenTo(comTop, 'colorchange', onColorChange)
                    .listenTo(comLeft, 'colorchange', onColorChange);
            } else if (col === 0 && row === rowSize) {
                //左下角 T R
                comTop = matrix[row - 1][col];
                comRight = rowArr[col + 1];
                com.listenTo(comTop, 'colorchange', onColorChange)
                    .listenTo(comRight, 'colorchange', onColorChange);
            }
        }
    }

    function getRandomRange(range) {
        return Math.round(Math.random() * range);
    }
    function onColorChange(color) {
        console.log('color change ' + this.id);
        var self = this;
        if (typeof color === 'string') {
            color = parseInt(color, 16);
        }
        var span = this.color - color;
        if (span < 100 && this.color < 16777115) {
            this.color += 100;
        } else if(span > 100 && span < 1000 && this.color > 200) {
            this.color -= 200;
        } else {
            this.color -= span + getRandomRange(10) * getRandomRange(1000);
        }
        this.update();
        setTimeout(function () {
            self.trigger('colorchange', self.color);
        }, 1000);
    }
    window.getRandomRange = getRandomRange;
    window.start = function (row, col, color) {
        matrix[row][col].trigger('colorchange', color);
    };
    window.stop = function () {
        for(var row = 0; row < rowSize; row++) {
            rowArr = matrix[row];
            for(var col = 0; col < colSize; col++) {
                var com = rowArr[col];
                com.stopListening();
            }
        }
    };
})(window);
