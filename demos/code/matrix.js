(function (window, undefined) {
    'use strict';
    var matrix = [],
        rowSize = 4,
        colSize = 4,
        rowArr;

    //创建 rowSize * colSize 的矩阵
    for(var i = 0; i < rowSize; i++) {
        //二维数组模拟矩阵
        matrix[i] = rowArr = [];
        //列
        for(var j = 0; j < colSize; j++) {
            var com = new Com({
                tplContent: '<div class="cell"></div>',
                row: i,
                col: j,
                id: 'm_' + i + '_' + j,
                parentEl: window.document.body
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
            var com = matrix[row][col];
            //先处理矩阵的主体，减少if判断次数
            if ( row > 0 && row < rowSize - 1 && col > 0 && col < colSize -1) {
                //矩阵主体为4联通节点  T R B L
                comTop = matrix[row - 1][col];
                comRight = matrix[row][col + 1];
                comLeft = matrix[row][col - 1];
                comBottom = matrix[row + 1][col];
                com.listenTo(comTop, 'colorchange', onColorChange)
                    .listenTo(comRight, 'colorchange', onColorChange)
                    .listenTo(comBottom, 'colorchange', onColorChange)
                    .listenTo(comLeft, 'colorchange', onColorChange);
            } else if (row === 0 && col > 0 && col < colSize - 1) {
                //上边缘联通方向, R B L

                comRight = matrix[row][col + 1];
                comLeft = matrix[row][col - 1];
                comBottom = matrix[row + 1][col];
                com.listenTo(comRight, 'colorchange', onColorChange)
                    .listenTo(comBottom, 'colorchange', onColorChange)
                    .listenTo(comLeft, 'colorchange', onColorChange);
            } else if (row === rowSize - 1 && col > 0 && col < colSize - 1) {
                //下边缘联通方向 T L R
                comTop = matrix[row - 1][col];
                comRight = matrix[row][col + 1];
                comLeft = matrix[row][col - 1];
                com.listenTo(comTop, 'colorchange', onColorChange)
                    .listenTo(comRight, 'colorchange', onColorChange)
                    .listenTo(comLeft, 'colorchange', onColorChange);
            } else if (col === 0 && row > 0 && row < rowSize - 1) {
                //左边缘联通方向 T R B
                comTop = matrix[row - 1][col];
                comRight = matrix[row][col + 1];
                comBottom = matrix[row + 1][col];
                com.listenTo(comTop, 'colorchange', onColorChange)
                    .listenTo(comRight, 'colorchange', onColorChange)
                    .listenTo(comBottom, 'colorchange', onColorChange);
            } else if (col === colSize - 1 && row > 0 && row < rowSize - 1) {
                //右边缘联通方向 T B L
                comTop = matrix[row - 1][col];
                comLeft = matrix[row][col - 1];
                comBottom = matrix[row + 1][col];
                com.listenTo(comTop, 'colorchange', onColorChange)
                    .listenTo(comBottom, 'colorchange', onColorChange)
                    .listenTo(comLeft, 'colorchange', onColorChange);
            } else if (col === 0 && row === 0) {
                //左上角 R B
                comRight = matrix[row][col + 1];
                comBottom = matrix[row + 1][col];
                com.listenTo(comRight, 'colorchange', onColorChange)
                    .listenTo(comBottom, 'colorchange', onColorChange);
            } else if (col === colSize && row === 0) {
                //右上角 B L
                comLeft = matrix[row][col - 1];
                comBottom = matrix[row + 1][col];
                com.listenTo(comBottom, 'colorchange', onColorChange)
                    .listenTo(comLeft, 'colorchange', onColorChange);
            } else if (col === colSize && row === rowSize) {
                //右下角 T L
                comTop = matrix[row - 1][col];
                comLeft = matrix[row][col - 1];
                com.listenTo(comTop, 'colorchange', onColorChange)
                    .listenTo(comLeft, 'colorchange', onColorChange);
            } else if (col === 0 && row === rowSize) {
                //左下角 T R
                comTop = matrix[row - 1][col];
                comRight = matrix[row][col + 1];
                com.listenTo(comTop, 'colorchange', onColorChange)
                    .listenTo(comRight, 'colorchange', onColorChange);
            }
        }
    }

    function onColorChange(color) {
        console.log(color);
    }
})(window);
