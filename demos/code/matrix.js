(function(window, undefined) {
    'use strict';
    var Com = window.Com,
        rowArr;

    var Matrix = Com.extend({
        type: 'matrix',
        init: function(option) {
            var Cell = option.Cell;
            this._super(option);
            this.rowSize = option.rowSize;
            this.colSize = option.colSize;
            this.matrixArr = [];
            //创建 rowSize * colSize 的矩阵
            for (var i = 0; i < this.rowSize; i++) {
                //二维数组模拟矩阵
                this.matrixArr[i] = rowArr = [];
                //列
                for (var j = 0; j < this.colSize; j++) {
                    var com = new Cell(i, j, 'cell_' + i + '_' + j);
                    rowArr.push(com);
                }
                this.appendChild(rowArr);
            }
        },
        net: function(evt, fn) {
            var colSize = this.colSize,
                rowSize = this.rowSize,
                matrixArr = this.matrixArr;
            var comTop, comRight, comBottom, comLeft;
            //矩阵节点联接
            for (var row = 0; row < rowSize; row++) {
                rowArr = matrixArr[row];
                for (var col = 0; col < colSize; col++) {
                    var com = rowArr[col];
                    //先处理矩阵的主体，减少if判断次数
                    if (row > 0 && row < rowSize - 1 && col > 0 && col < colSize - 1) {
                        //矩阵主体为4联通节点  T R B L
                        comTop = matrixArr[row - 1][col];
                        comRight = rowArr[col + 1];
                        comLeft = rowArr[col - 1];
                        comBottom = matrixArr[row + 1][col];
                        com.listenTo(comTop, evt, fn)
                            .listenTo(comRight, evt, fn)
                            .listenTo(comBottom, evt, fn)
                            .listenTo(comLeft, evt, fn);
                    } else if (row === 0 && col > 0 && col < colSize - 1) {
                        //上边缘联通方向, R B L

                        comRight = rowArr[col + 1];
                        comLeft = rowArr[col - 1];
                        comBottom = matrixArr[row + 1][col];
                        com.listenTo(comRight, evt, fn)
                            .listenTo(comBottom, evt, fn)
                            .listenTo(comLeft, evt, fn);
                    } else if (row === rowSize - 1 && col > 0 && col < colSize - 1) {
                        //下边缘联通方向 T L R
                        comTop = matrixArr[row - 1][col];
                        comRight = rowArr[col + 1];
                        comLeft = rowArr[col - 1];
                        com.listenTo(comTop, evt, fn)
                            .listenTo(comRight, evt, fn)
                            .listenTo(comLeft, evt, fn);
                    } else if (col === 0 && row > 0 && row < rowSize - 1) {
                        //左边缘联通方向 T R B
                        comTop = matrixArr[row - 1][col];
                        comRight = rowArr[col + 1];
                        comBottom = matrixArr[row + 1][col];
                        com.listenTo(comTop, evt, fn)
                            .listenTo(comRight, evt, fn)
                            .listenTo(comBottom, evt, fn);
                    } else if (col === colSize - 1 && row > 0 && row < rowSize - 1) {
                        //右边缘联通方向 T B L
                        comTop = matrixArr[row - 1][col];
                        comLeft = rowArr[col - 1];
                        comBottom = matrixArr[row + 1][col];
                        com.listenTo(comTop, evt, fn)
                            .listenTo(comBottom, evt, fn)
                            .listenTo(comLeft, evt, fn);
                    } else if (col === 0 && row === 0) {
                        //左上角 R B
                        comRight = rowArr[col + 1];
                        comBottom = matrixArr[row + 1][col];
                        com.listenTo(comRight, evt, fn)
                            .listenTo(comBottom, evt, fn);
                    } else if (col === colSize - 1 && row === 0) {
                        //右上角 B L
                        comLeft = rowArr[col - 1];
                        comBottom = matrixArr[row + 1][col];
                        com.listenTo(comBottom, evt, fn)
                            .listenTo(comLeft, evt, fn);
                    } else if (col === colSize - 1 && row === rowSize - 1) {
                        //右下角 T L
                        comTop = matrixArr[row - 1][col];
                        comLeft = rowArr[col - 1];
                        com.listenTo(comTop, evt, fn)
                            .listenTo(comLeft, evt, fn);
                    } else if (col === 0 && row === rowSize - 1) {
                        //左下角 T R
                        comTop = matrixArr[row - 1][col];
                        comRight = rowArr[col + 1];
                        com.listenTo(comTop, evt, fn)
                            .listenTo(comRight, evt, fn);
                    }
                }
            }
        }
    });
    window.Matrix = Matrix;
})(window);
