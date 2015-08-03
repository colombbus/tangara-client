define(['jquery', 'TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'SynchronousManager', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, SynchronousManager, TUtils) {
    /**
     * Defines Turtle, inherited from Sprite.
     * Turtle can move forward or backward in any direction.
     * It can draw the path that it has taken.
     * @exports Turtle
     */
    var Turtle = function() {
        Sprite.call(this);
        this.addImage("turtle.png", "", false);
        this.setDisplayedImage("turtle.png");
        this.synchronousManager = new SynchronousManager();
        this.gObject.synchronousManager = this.synchronousManager;
        var gObject = this.gObject;
    };
    
    Turtle.prototype = Object.create(Sprite.prototype);
    Turtle.prototype.constructor = Turtle;
    Turtle.prototype.className = "Turtle";

    var graphics = Turtle.prototype.graphics;

    Turtle.prototype.gClass = graphics.addClass("TSprite", "TTurtle", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                inMovement: false,
                type: TGraphicalObject.TYPE_TURTLE,
                tangle: 0,
                tx: 50,
                ty: 50,
                stroke: true,
                strokeColor: "#FF0000",
                trackPath: true,
                coordinates: [],
                velocityX: 200,
                velocityY: 200
            }, props), defaultProps);
        },
        move: function(value) {
            this.perform(function(value) {
                var x = Math.cos((this.p.tangle - 90) / 180 * Math.PI) * value;
                var y = Math.sin((this.p.tangle - 90) / 180 * Math.PI) * value;
                if (this.p.trackPath) {
                    this.p.coordinates.push([this.p.destinationX, this.p.destinationY, this.p.strokeColor]);
                }
                if (Math.abs(x) > Math.abs(y)) {
                    this.p.velocityY = this.p.velocity * (Math.abs(y) / Math.abs(x));
                    this.p.velocityX = this.p.velocity;
                } else {
                    this.p.velocityX = this.p.velocity * (Math.abs(x) / Math.abs(y));
                    this.p.velocityY = this.p.velocity;
                }
                this.p.inMovement = true;
                this.synchronousManager.begin();
                this.p.destinationX += x;
                this.p.destinationY += y;
                if (this.p.trackPath) {
                    this.p.coordinates.push([this.p.destinationX, this.p.destinationY, this.p.strokeColor]);
                }
            }, [value]);
        },
        rotate: function(angle) {
            this.perform(function(angle) {
                this.p.tangle = this.p.tangle + angle;
            }, [angle]);
        },
        step: function(dt) {
            var p = this.p;
            if (p.inMovement)
            {
                p.moving = false;
                if (!p.dragging && !p.frozen) {
                    var stepX = p.velocityX * dt;
                    var stepY = p.velocityY * dt;
                    if (p.tx < p.destinationX) {
                        p.tx = Math.min(p.tx + stepX, p.destinationX);
                        p.moving = true;
                    } else if (p.tx > p.destinationX) {
                        p.tx = Math.max(p.tx - stepX, p.destinationX);
                        p.moving = true;
                    }
                    if (p.ty < p.destinationY) {
                        p.ty = Math.min(p.ty + stepY, p.destinationY);
                        p.moving = true;
                    } else if (p.ty > p.destinationY) {
                        p.ty = Math.max(p.ty - stepY, p.destinationY);
                        p.moving = true;
                    }
                    if (Math.abs(p.tx - p.destinationX) < 0.0000000001) {
                        p.tx = p.destinationX;
                    }
                    if (Math.abs(p.ty - p.destinationY) < 0.0000000001) {
                        p.ty = p.destinationY;
                    }
                }
                if (!p.moving) {
                    p.inMovement = false;
                    this.synchronousManager.end();
                }
            }
        },
        draw: function(ctx) {
            var p = this.p;
            for (var i = 0 ; i < p.coordinates.length ; i += 2) {
                ctx.beginPath();
                ctx.moveTo(p.coordinates[i][0] - p.cx, p.coordinates[i][1] - p.cy);
                if (i >= p.coordinates.length - 2 && p.trackPath) {
                    ctx.lineTo(p.tx - p.cx, p.ty - p.cy);
                } else {
                    ctx.lineTo(p.coordinates[i + 1][0] - p.cx, p.coordinates[i + 1][1] - p.cy);
                }
                ctx.closePath();
                ctx.strokeStyle = p.coordinates[i][2];
                ctx.stroke();
            }
            
            ctx.translate(p.tx - 50, p.ty - 50);
            ctx.rotate(this.p.tangle / 180 * Math.PI);
            if (p.asset) {
                ctx.drawImage(this.resources.getUnchecked(p.asset), -p.cx, -p.cy);
            }
        },
        colorPath: function(color) {
           this.p.strokeColor = color;
        },
        trackPath: function(value) {
            this.perform(function(value) {
                this.p.trackPath = value;
            }, [value]);
        }
    });
    
    /**
     * Move Turtle of "value" pixels forward, depending of its angle.
     * @param {Number} value
     */
    Turtle.prototype._moveForward = function(value) {
        if (typeof value !== 'undefined') {
            value = TUtils.getInteger(value);
            this.gObject.move(value);
        }
    };
    
    /**
     * Move Turtle of "value" pixels backward, depending of its angle.
     * @param {Number} value
     */
    Turtle.prototype._moveBackward = function(value) {
        if (typeof value !== 'undefined') {
            value = TUtils.getInteger(value);
            this.gObject.move(-value);
        }
    };

    /**
     * Change the color of the path.
     * @param {String} value
     */
    Turtle.prototype._colorPath = function(value) {
        if (typeof value !== 'undefined') {
            this.gObject.colorPath(value);
        }
    };
    
    /**
     * Set trackPath to false.
     * See _trackPath() for more information.
     */
    Turtle.prototype._untrackPath = function() {
        this.gObject.trackPath(false);
    };
    
    /**
     * Set trackPath to true.
     * When trackPath is at true, the path borrowed by Turtle is tracked.
     * When trackPath is at false, the path borrowed by Turtle is not tracked.
     * The tracked path is drawn.
     */
    Turtle.prototype._trackPath = function() {
        this.gObject.trackPath(true);
    };
    
    return Turtle;
});