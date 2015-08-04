define(['jquery', 'TEnvironment', 'TGraphicalObject', 'TUtils'], function($, TEnvironment, TGraphicalObject, TUtils) {
    /**
     * Defines Shape, inherited from TGraphicalObject.
     * @exports Shape
     */
    var Shape = function() {
        TGraphicalObject.call(this);
    };
    
    Shape.prototype = Object.create(TGraphicalObject.prototype);
    Shape.prototype.constructor = Shape;
    Shape.prototype.className = "Shape";

    var graphics = Shape.prototype.graphics;

    Shape.prototype.gClass = graphics.addClass("TGraphicalObject", "TShape", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                color: "#FF0000",
                width: 1,
                fill: false,
                fillColor: "#800000",
                type: TGraphicalObject.TYPE_SHAPE,
                x: 0,
                y: 0,
                initialized: true,
            }, props), defaultProps);
        },
        moveX: function(value) {
            this.perform(function(value) {
                this.p.x += value;
            }, [value]);
        },
        moveY: function(value) {
            this.perform(function(value) {
                this.p.y += value;
            }, [value]);
        },
        color: function(red, green, blue) {
           this.p.color = TUtils.rgbToHex(TUtils.getColor(red, green, blue));
        },
        width: function(value) {
            this.p.width = value;
        },
        fill: function(value) {
            this.p.fill = value;
        },
        fillColor: function(red, green, blue) {
           this.p.fillColor = TUtils.rgbToHex(TUtils.getColor(red, green, blue));
        }
    });
    
    /**
     * Move Shape of "value" pixels forward (to the right).
     * @param {Number} value
     */
    Shape.prototype._moveForward = function(value) {
        if (typeof value !== 'undefined') {
            value = TUtils.getInteger(value);
            this.gObject.moveX(value);
        }
    };
    
    /**
     * Move Shape of "value" pixels backward (to the left).
     * @param {Number} value
     */
    Shape.prototype._moveBackward = function(value) {
        if (typeof value !== 'undefined') {
            value = TUtils.getInteger(value);
            this.gObject.moveX(-value);
        }
    };
    /**
     * Move Shape of "value" pixels upward.
     * @param {Number} value
     */
    Shape.prototype._moveUpward = function(value) {
        if (typeof value !== 'undefined') {
            value = TUtils.getInteger(value);
            this.gObject.moveY(value);
        }
    };
    
    /**
     * Move Shape of "value" pixels downward.
     * @param {Number} value
     */
    Shape.prototype._moveDownward = function(value) {
        if (typeof value !== 'undefined') {
            value = TUtils.getInteger(value);
            this.gObject.moveY(-value);
        }
    };
    
    /**
     * Change the color of the shape.</br>
     * Default value : red | [255, 0, 0]
     * @param {String|Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    Shape.prototype._color = function(red, green, blue) {
        this.gObject.color(red, green, blue);
    };
    
    /**
     * Set the width of the stroke.
     * Default value : 1.
     * @param {Number} value
     */
    Shape.prototype._width = function(value) {
        if (typeof value !== 'undefined') {
            value = TUtils.getInteger(value);
            this.gObject.width(value);
        }
    };
        
    /**
     * Enable or disable the fill of the polygon.
     * Default value : False. 
     * @param {Boolean} value
     */
    Shape.prototype._fill = function(value) {
        if (typeof value !== 'undefined') {
            this.gObject.fill(value);
        }
    };
    
    /**
     * Change the color of the shape's fill.</br>
     * Default value : marron | [128, 0, 0]
     * @param {String|Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    Shape.prototype._fillColor = function(red, green, blue) {
        this.gObject.fillColor(red, green, blue);
    };
    
    return Shape;
});