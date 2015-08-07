define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'ResourceManager', 'TGraphicalObject'], function($, TEnvironment, TUtils, CommandManager, ResourceManager, TGraphicalObject) {
    /**Spri
     * Defines Sprite, inherited from TGraphicalObject.
     * It's a very complete graphical objects : it can have several appearances,
     * move, or have collisions.
     * @param {String} name Sprite's name
     * @exports Sprite
     */
    var Sprite = function(name) {
        TGraphicalObject.call(this);
        this.images = new Array();
        this.imageSets = new Array();
        this.transparentColors = new Array();
        this.displayedImage = null;
        this.displayedSet = "";
        this.displayedIndex = 0;
        this.resources = new ResourceManager();
        this.gObject.setResources(this.resources);
        this.waitingForImage = "";
        if (typeof name === 'string') {
            this._setImage(name);
        }
    };

    Sprite.prototype = Object.create(TGraphicalObject.prototype);
    Sprite.prototype.constructor = Sprite;
    Sprite.prototype.className = "Sprite";

    var graphics = Sprite.prototype.graphics;

    Sprite.prototype.gClass = graphics.addClass("TGraphicalObject", "TSprite", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                collisionWatched: false,
            }, props), defaultProps);
            this.watchCollisions(true);
            this.encounteredObjects = new Array();
            this.lastEncounteredObjects = new Array();
        },
        goTo: function(x, y) {
            this.perform(function(x, y) {
                this.p.destinationX = x + this.p.w / 2;
                this.p.destinationY = y + this.p.h / 2;
                this.p.direction = Sprite.DIRECTION_NONE;
            }, [x, y]);
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
     * Move Sprite's top-left pixel to coordinates {x,y}.
     * @param {Number} x
     * @param {Number} y
     */
    Sprite.prototype._goTo = function(x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.gObject.goTo(x, y);
    };

    /**
     * Checks if Sprite have collisions triggered.
     * @param {Boolean} value
     */
    Sprite.prototype._watchCollisions = function(value) {
        value = TUtils.getBoolean(value);
        this.gObject.watchCollisions(value);
    };

    return Sprite;
});
