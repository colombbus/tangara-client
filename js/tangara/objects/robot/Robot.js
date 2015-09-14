define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'SynchronousManager', 'objects/hero/Hero'], function($, TEnvironment, TUtils, CommandManager, SynchronousManager, Hero) {
    /**
     * Defines Robot, inherited from Hero.
     * The main difference with Hero is that it executes commands one by one.
     * @exports Robot
     */
    var Robot = function() {
        Hero.call(this, "robot");
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
                length: 80,
                inMovement: false,
                encountered: [],
                carriedItems: [],
                arrayX: 0,
                arrayY: 0,
                x: 14,
                y: 5
            }, props), defaultProps);
        },
        step: function(dt) {
            this._super(dt);
            var p = this.p;
            if (!p.dragging && !p.frozen) {
                if (p.moving) {
                    var x = p.x - p.w / 2;
                    var y = p.y - p.h / 2;
                    for (var i = 0; i < p.carriedItems.length; i++) {
                        var item = p.carriedItems[i];
                        item.setLocation(x + i * 10, y);
                    }
                }
                if (p.blocked && p.moving) {
                    this.stop();
                }
                if (p.inMovement && !p.moving) {
                    p.inMovement = false;
                    this.synchronousManager.end();
                }
            }
        },
        moveForward: function(value) {
            this.synchronousManager.begin();
            this.perform(function(value) {
                this.p.inMovement = true;
                this.p.arrayX += value;
                this.p.destinationX += value * this.p.length;
            }, [value]);
        },
        moveBackward: function(value) {
            this.synchronousManager.begin();
            this.perform(function(value) {
                this.p.inMovement = true;
                this.p.arrayX -= value;
                this.p.destinationX -= value * this.p.length;
            }, [value]);
        },
        moveUpward: function(value) {
            this.synchronousManager.begin();
            this.perform(function(value) {
                this.p.inMovement = true;
                this.p.arrayY -= value;
                this.p.destinationY -= value * this.p.length;
            }, [value]);
        },
        moveDownward: function(value) {
            this.synchronousManager.begin();
            this.perform(function(value) {
                this.p.inMovement = true;
                this.p.arrayY += value;
                this.p.destinationY += value * this.p.length;
            }, [value]);
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
            this.gObject.moveForward(number);
        } else {
            this.gObject.moveForward(1);
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
            this.gObject.moveBackward(number);
        } else {
            this.gObject.moveBackward(1);
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
            this.gObject.moveUpward(number);
        } else {
            this.gObject.moveUpward(1);
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
            this.gObject.moveDownward(number);
        } else {
            this.gObject.moveDownward(1);
        }   
    };

    /**
     * Set the base value of movements.
     * It's the value used if no parameter are entered to movement actions.
     * @param {Number} value
     */
    Robot.prototype._setStep = function(value) {
        value = TUtils.getInteger(value);
        this.step = value;
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

    return Robot;
});

