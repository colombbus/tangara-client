define(['jquery', 'TEnvironment', 'TGraphicalObject', 'TUtils', 'objects/shapes/polygon/Polygon'], function ($, TEnvironment, TGraphicalObject, TUtils, Polygon) {
    /**
     * Defines Quadrilateral, inherited from Polygon.
     * @exports Quadrilateral
     */
    var Quadrilateral = function () {
        Polygon.call(this);
    };

    Quadrilateral.prototype = Object.create(Polygon.prototype);
    Quadrilateral.prototype.constructor = Quadrilateral;
    Quadrilateral.prototype.className = "Quadrilateral";

    var graphics = Quadrilateral.prototype.graphics;

    Quadrilateral.prototype.gClass = graphics.addClass("TPolygon", "TQuadrilateral", {
        init: function (props, defaultProps) {
            this._super(TUtils.extend({
            }, props), defaultProps);
        },
        setVertices: function (value) {
            this.p.vertices = [];
            if (value.length === 4) {
                for (var i = 0; i < value.length; i++) {
                    this.p.vertices.push(value[i]);
                }
                this.p.initVertices = true;
            } else {
                throw new Error(this.getMessage("Bad vertices"));
            }
        }
    });

    return Quadrilateral;
});