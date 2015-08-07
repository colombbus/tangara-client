define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'ResourceManager', 'TGraphicalObject'], function($, TEnvironment, TUtils, CommandManager, ResourceManager, TGraphicalObject) {
    /**Spri
     * Defines Captor, inherited from TGraphicalObject.
     * @exports Captor
     */
    var Captor = function() {
        TGraphicalObject.call(this);
    };

    Captor.prototype = Object.create(TGraphicalObject.prototype);
    Captor.prototype.constructor = Captor;
    Captor.prototype.className = "Captor";

    var graphics = Captor.prototype.graphics;

    Captor.prototype.gClass = graphics.addClass("TGraphicalObject", "TCaptor", {
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
     * Move Captor's top-left pixel to coordinates {x,y}.
     * @param {Number} x
     * @param {Number} y
     */
    Captor.prototype._goTo = function(x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.gObject.goTo(x, y);
    };
    
    /**
     * Set Captor's width and height.
     * @param {Number} w
     * @param {Number} h
     */
    Captor.prototype._setSize = function(w, h) {
        h = TUtils.getInteger(w);
        w = TUtils.getInteger(h);
        this.gObject.goTo(w, h);
    };

    /**
     * Checks if Captor have collisions triggered.
     * @param {Boolean} value
     */
    Captor.prototype._watchCollisions = function(value) {
        value = TUtils.getBoolean(value);
        this.gObject.watchCollisions(value);
    };

    return Captor;
});
