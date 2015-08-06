define(['jquery', 'TEnvironment', 'TGraphicalObject', 'TUtils', 'objects/shapes/quadrilateral/Quadrilateral', 'objects/shapes/Point/Point'], function ($, TEnvironment, TGraphicalObject, TUtils, Quadrilateral, Point) {
    /**
     * Defines Parallelogram, inherited from Quadrilateral.
     * @exports Parallelogram
     */
    var Parallelogram = function () {
        Quadrilateral.call(this);
    };

    Parallelogram.prototype = Object.create(Quadrilateral.prototype);
    Parallelogram.prototype.constructor = Parallelogram;
    Parallelogram.prototype.className = "Parallelogram";

    var graphics = Parallelogram.prototype.graphics;

    Parallelogram.prototype.gClass = graphics.addClass("TQuadrilateral", "TParallelogram", {
        init: function (props, defaultProps) {
            this._super(TUtils.extend({
            }, props), defaultProps);
        },
        setVertices: function (value) {
            this.p.vertices = [];
            if (value.length === 3) {
                for (var i = 0; i < value.length; i++) {
                    this.p.vertices.push(value[i]);
                }
                this.addPointParallelogram(value);
                this.p.initVertices = true;
            } else {
                throw new Error(this.getMessage("Bad vertices"));
            }
        },
        addPointParallelogram: function (value) {
            var point = new Point();
            point._hide();
            point._setLocation(value[0].gObject.p.x - value[1].gObject.p.x + value[2].gObject.p.x,
                               value[0].gObject.p.y - value[1].gObject.p.y + value[2].gObject.p.y);
            this.p.vertices.push(point);
        }
    });

    return Parallelogram;
});