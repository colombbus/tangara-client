define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'ResourceManager', 'TGraphicalObject'], function($, TEnvironment, TUtils, CommandManager, ResourceManager, TGraphicalObject) {
    /**Spri
     * Defines Sensor, inherited from TGraphicalObject.
     * @exports Sensor
     */
    var Sensor = function() {
        TGraphicalObject.call(this);
    };

    Sensor.prototype = Object.create(TGraphicalObject.prototype);
    Sensor.prototype.constructor = Sensor;
    Sensor.prototype.className = "Sensor";

    var graphics = Sensor.prototype.graphics;

    Sensor.prototype.gClass = graphics.addClass("TGraphicalObject", "TSensor", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                collisionWatched: false,
            }, props), defaultProps);
            this.watchCollisions(true);
        },
        goTo: function(x, y) {
            this.perform(function(x, y) {
                this.p.x = x;
                this.p.y = y;
            }, [x, y]);
        },
        setSize: function(w, h) {
            this.perform(function(w, h) {
                this.p.w = w;
                this.p.h = h;
                graphics.objectResized(this);
            }, [w, h]);
        },
        watchCollisions: function(value) {
            this.perform(function(value) {
                if (value === this.p.collisionWatched)
                    return;
                if (value) {
                    this.on("hit", this, "objectEncountered");
                } else {
                    this.off("hit", this, "objectEncountered");
                }
                this.p.collisionWatched = value;
            }, [value]);
        }
    });
    
    /**
     * Move Sensor's top-left pixel to coordinates {x,y}.
     * @param {Number} x
     * @param {Number} y
     */
    Sensor.prototype._goTo = function(x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.gObject.goTo(x, y);
    };
    
    /**
     * Set Sensor's width and height.
     * @param {Number} w
     * @param {Number} h
     */
    Sensor.prototype._setSize = function(w, h) {
        h = TUtils.getInteger(w);
        w = TUtils.getInteger(h);
        this.gObject.goTo(w, h);
    };

    /**
     * Checks if Sensor have collisions triggered.
     * @param {Boolean} value
     */
    Sensor.prototype._watchCollisions = function(value) {
        value = TUtils.getBoolean(value);
        this.gObject.watchCollisions(value);
    };

    return Sensor;
});
