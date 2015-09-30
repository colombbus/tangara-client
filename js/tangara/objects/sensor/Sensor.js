define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'ResourceManager', 'objects/sprite/Sprite'], function ($, TEnvironment, TUtils, CommandManager, ResourceManager, Sprite) {
    /**
     * Defines Sensor, inherited from Sprite.
     * @exports Sensor
     */
    var Sensor = function () {
        Sprite.call(this);
    };

    Sensor.prototype = Object.create(Sprite.prototype);
    Sensor.prototype.constructor = Sensor;
    Sensor.prototype.className = "Sensor";

    var graphics = Sensor.prototype.graphics;

    Sensor.prototype.gClass = graphics.addClass("TSprite", "TSensor", {
        init: function (props, defaultProps) {
            this._super(TUtils.extend({
                initialized: true,
                hidden: true
            }, props), defaultProps);
            this.watchCollisions(true);
        },
        setSize: function (w, h) {
            this.perform(function (w, h) {
                this.p.w = w;
                this.p.h = h;
                graphics.objectResized(this);
                this.p.x += w / 2;
                this.p.y += h / 2;
            }, [w, h]);
        },
        draw: function (ctx) {
            var p = this.p;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(p.w, 0);
            ctx.lineTo(p.w, p.h);
            ctx.lineTo(0, p.h);
            ctx.closePath();
            ctx.strokeStyle = "#FF0000";
            ctx.stroke();
            ctx.fillStyle = "#800000"
            ctx.fill();
        }
    });

    /**
     * Set Sensor's width and height.
     * @param {Number} w
     * @param {Number} h
     */
    Sensor.prototype._setSize = function (w, h) {
        h = TUtils.getInteger(w);
        w = TUtils.getInteger(h);
        this.gObject.setSize(w, h);
    };

    return Sensor;
});
