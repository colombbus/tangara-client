define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'SynchronousManager', 'objects/hero/Hero'], function($, TEnvironment, TUtils, CommandManager, SynchronousManager, Hero) {
    /**
     * Defines Robot, inherited from Hero.
     * The main difference with Hero is that it executes commands one by one.
     * @param {String} name
     * @exports Robot
     */
    var Robot = function(name) {
        if (typeof name !== 'undefined') {
            Hero.call(this, name);
        } else {
            Hero.call(this, "robot");
        }
        this.synchronousManager = new SynchronousManager();
        this.gObject.synchronousManager = this.synchronousManager;
        var gObject = this.gObject;
    };


    Robot.prototype = Object.create(Hero.prototype);
    Robot.prototype.constructor = Robot;
    Robot.prototype.className = "Robot";

    var graphics = Robot.prototype.graphics;

    Robot.prototype.gClass = graphics.addClass("THero", "TRobot", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                length: 40,
                inMovement: false,
                encountered: [],
                carriedItems: [],
                gridX: 0,
                gridY: 0,
                baseX: 0,
                baseY: 0,
                x: 0,
                y: 0
            }, props), defaultProps);
        },
        step: function(dt) {
            var p = this.p;
            var oldX = p.x;
            var oldY = p.y;
            this._super(dt);
            if (!p.dragging && !p.frozen) {
                if (p.moving) {
                    var x = p.x - p.w / 2;
                    var y = p.y - p.h / 2;
                    for (var i = 0; i < p.carriedItems.length; i++) {
                        var item = p.carriedItems[i];
                        item.setLocation(x + i * 10, y);
                    }
                } else if (p.mayFall && !(p.platform && p.platform[x] && p.platform[x][y + 1])) {
                    this.moveDownward();
                }
                    
                //TODO: remove p.blocked?
                if (p.inMovement && p.moving && p.blocked && oldX === p.x && oldY === p.y) {
                    p.moving = false;
                    p.destinationX = p.x;
                    p.destinationY = p.y;
                }
                if (p.inMovement && !p.moving) {
                    p.inMovement = false;
                    this.updateGridLocation();
                    this.synchronousManager.end();
                }
            }
        },
        moveForward: function() {
            this.synchronousManager.begin();
            this.perform(function() {
                this.p.inMovement = true;
                this.p.destinationX += this.p.length;
            }, []);
        },
        moveBackward: function() {
            this.synchronousManager.begin();
            this.perform(function() {
                this.p.inMovement = true;
                this.p.destinationX -= this.p.length;
            }, []);
        },
        moveUpward: function() {
            this.synchronousManager.begin();
            this.perform(function() {
                this.p.inMovement = true;
                this.p.destinationY -= this.p.length;
            }, []);
        },
        moveDownward: function() {
            this.synchronousManager.begin();
            this.perform(function() {
                this.p.inMovement = true;
                this.p.destinationY += this.p.length;
            }, []);
        },
        countItems: function() {
            var skip = 0;
            var collided = this.stage.TsearchSkip(this, TGraphicalObject.TYPE_ITEM, skip);
            var object;
            this.p.encountered = [];
            while (collided) {
                object = collided.obj;
                if (this.p.carriedItems.indexOf(object) === -1) {
                    this.p.encountered.push(collided.obj);
                }
                skip++;
                collided = this.stage.TsearchSkip(this, TGraphicalObject.TYPE_ITEM, skip);
            }
            return this.p.encountered.length;
        },
        pickupItem: function() {
            var count = this.countItems();
            if (count === 0) {
                throw "no item";
            }
            var newItem = this.p.encountered[0];
            this.p.carriedItems.push(newItem);
            newItem.setLocation(this.p.x - this.p.w / 2 + (this.p.carriedItems.length - 1) * 10, this.p.y - this.p.h / 2);
        },
        dropItem: function() {
            if (this.p.carriedItems.length === 0) {
                throw "no carried item";
            }
            this.p.carriedItems = this.p.carriedItems.slice(0, -1);
        },
        countCarriedItems: function() {
            return this.p.carriedItems.length;
        },
        setLocation: function(x, y) {
            this._super(x, y);            
            this.perform(function() {
                this.updateGridLocation();
            }, []);
        },
        updateGridLocation: function() {
            this.p.gridX = Math.floor(this.p.x/this.p.length);
            this.p.gridY = Math.floor(this.p.y/this.p.length);
        }
    });

    // MOVEMENT MANAGEMENT
    
    /**
     * Move Robot of "number" tiles forward (to the right).
     * If no parameter is given, move it one case forward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Robot.prototype._moveForward = function(number) {
        if (typeof number !== 'undefined') {
            number = TUtils.getInteger(number);
        } else {
            number = 1;
        }
        for (var i = 0 ; i < number ; i++) {
            this.gObject.moveForward();
        }
    };
    
    /**
     * Move Robot of "number" tiles backward (to the left).
     * If no parameter is given, move it one case backward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Robot.prototype._moveBackward = function(number) {
        if (typeof number !== 'undefined') {
            number = TUtils.getInteger(number);
        } else {
            number = 1;
        }
        for (var i = 0 ; i < number ; i++) {
            this.gObject.moveBackward();
        }
    };
   
    /**
     * Move Robot of "number" tiles upward.
     * If no parameter is given, move it one case upward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Robot.prototype._moveUpward = function(number) {
        if (typeof number !== 'undefined') {
            number = TUtils.getInteger(number);
        } else {
            number = 1;
        }
        for (var i = 0 ; i < number ; i++) {
            this.gObject.moveUpward();
        }
    };

    /**
     * Move Robot of "number" tiles downward.
     * If no parameter is given, move it one case downward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Robot.prototype._moveDownward = function(number) {
        if (typeof number !== 'undefined') {
            number = TUtils.getInteger(number);
        } else {
            number = 1;
        }
        for (var i = 0 ; i < number ; i++) {
            this.gObject.moveDownward();
        }
    };

    /**
     * Robot jumps of two tiles.
     */
    Robot.prototype._jump = function() {
        this.gObject.moveForward();
        this.gObject.moveForward();
    };

    /**
     * Count the number of items in Stage.
     * @returns {Number}
     */
    Robot.prototype._countItems = function() {
        //TODO: handle case where gObject not initialized yet
        return this.gObject.countItems();
    };

    /**
     * Pick up an Item.
     */
    Robot.prototype._pickupItem = function() {
        this.gObject.pickupItem();
    };

    /**
     * Drop an Item.
     */
    Robot.prototype._dropItem = function() {
        this.gObject.dropItem();
    };

    /**
     * Count the number of items carried by Robot.
     * @returns {Number}    Number of items carried.
     */
    Robot.prototype._countCarriedItems = function() {
        return this.gObject.countCarriedItems();
    };
    
    /**
     * Get the Platform for Robot.
     * @param {Number[][]} platform
     */
    Robot.prototype._getPlatform = function(platform) {
        this.gObject.p.platform = platform;
    };
    
    /**
     * Set the coordinates of Robot.
     * @param {Number} x
     * @param {Number} y
     */
    Robot.prototype._setLocation = function(x, y) {
        x = TUtils.getInteger(x) * this.gObject.p.length + this.gObject.p.baseX;
        y = TUtils.getInteger(y) * this.gObject.p.length + this.gObject.p.baseY;
        this.gObject.setLocation(x, y);
    };
    
    return Robot;
});
