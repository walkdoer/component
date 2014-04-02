(function (window, undefined) {
    'use strict';
    var Com = window.Com,
        Matrix = window.Matrix,
        getRandomColor = function(){
        return getRandomRange(16777215).toString(16);
    };


    function getRandomRange(range) {
        return Math.round(Math.random() * range);
    }
    function onColorChange(ev, color) {
        var self = this;
        if (typeof color === 'string') {
            color = parseInt(color, 16);
        }
        this.color = color;
        if (this.needUpdate()) {
            this.update();
            this.timer || (this.timer = setTimeout(function () {
                self.trigger('colorchange', self.color);
                clearTimeout(self.timer);
                self.timer = null;
            }, 100));
        }
    }
    var Cell = Com.extend({
        tplContent: '<div class="cell" style="background:<%_state_.color%>"></div>',
        color: 0,
        init: function(row, col, id) {
            this.row = row;
            this.col = col;
            this._super({
                id: id
            });
        },
        setColor: function (color) {
            this.color = parseInt(color, 16);
        },
        uiEvents: {
            'click': function(evt, self) {
                self.setColor(getRandomColor());
                self.update();
                self.trigger('colorchange', self.color);
            }
        },
        getState: function() {
            return {
                color: '#' + this.color.toString(16)
            };
        }
    });
    var matrix = new Matrix({
        id: 'color-matrix',
        parentEl: window.document.body,
        rowSize: 4,
        colSize: 4,
        Cell: Cell
    });
    matrix.net('colorchange', onColorChange);
    matrix.render().appendToParent();
})(window);
