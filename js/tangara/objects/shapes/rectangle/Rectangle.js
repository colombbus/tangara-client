define(['jquery', 'TEnvironment', 'TGraphicalObject', 'TUtils', 'objects/shapes/parallelogram/Parallelogram', 'objects/shapes/Point/Point'], function ($, TEnvironment, TGraphicalObject, TUtils, Parallelogram, Point) {
    /**
     * Defines Rectangle, inherited from Parallelogram.
     * @exports Rectangle
     */
    var Rectangle = function () {
        Parallelogram.call(this);
    };

    Rectangle.prototype = Object.create(Parallelogram.prototype);
    Rectangle.prototype.constructor = Rectangle;
    Rectangle.prototype.className = "Rectangle";

    var graphics = Rectangle.prototype.graphics;

    Rectangle.prototype.gClass = graphics.addClass("TParallelogram", "TRectangle", {
        init: function (props, defaultProps) {
            this._super(TUtils.extend({
            }, props), defaultProps);
        },
        setVertices: function (value) {
            this.p.vertices = [];
            if (value.length === 2) {
                for (var i = 0; i < value.length; i++) {
                    this.p.vertices.push(value[i]);
                }
                this.addPointRectangle(value);
                this.addPointParallelogram(value);
                this.p.initVertices = true;
            } else {
                throw new Error(this.getMessage("Bad vertices"));
            }
        },
        addPointRectangle: function (value) {
            var point = new Point();
            point._hide();
            point._setLocation(value[0].gObject.p.x, value[1].gObject.p.y);
            this.p.vertices.push(point);
        }
    });

    return Rectangle;
});