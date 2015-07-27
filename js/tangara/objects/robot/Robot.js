define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'SynchronousManager', 'objects/hero/Hero'], function($, TEnvironment, TUtils, CommandManager, SynchronousManager, Hero) {
    /**
     * Defines Robot, inherited from Hero.
     * The main difference with Hero is that it executes commands one by one.
     * @exports Robot
     */
    var Robot = function() {
        Hero.call(this, "robot");
        this.step = 50;
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
                inMovement: false,
                encountered: [],
                carriedItems: []
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
                if (p.inMovement && !p.moving) {
                    p.inMovement = false;
                    this.synchronousManager.end();
                }
            }
        },
        moveForward: function(value) {
            this.perform(function(value) {
                this.p.inMovement = true;
                this.synchronousManager.begin();
                this.p.destinationX += value;
            }, [value]);
        },
        moveBackward: function(value) {
            this.perform(function(value) {
                this.p.inMovement = true;
                this.synchronousManager.begin();
                this.p.destinationX -= value;
            }, [value]);
        },
        moveUpward: function(value) {
            this.perform(function(value) {
                this.p.inMovement = true;
                this.synchronousManager.begin();
                this.p.destinationY -= value;
            }, [value]);
        },
        moveDownward: function(value) {
            this.perform(function(value) {
                this.p.inMovement = true;
                this.synchronousManager.begin();
                this.p.destinationY += value;
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
     * Move Sprite of "value" pixels forward (to the right).
     * if "value" is undefined, always move forward.
     * @param {Number} value
     */
    Robot.prototype._moveForward = function(value) {
        if (typeof value === 'undefined') {
            value = this.step;
        }
        value = TUtils.getInteger(value);
        this.gObject.moveForward(value);
    };
    
    /**
     * Move Sprite of "value" pixels backward (to the left).
     * if "value" is undefined, always move backward.
     * @param {Number} value
     */
    Robot.prototype._moveBackward = function(value) {
        if (typeof value === 'undefined') {
            value = this.step;
        }
        value = TUtils.getInteger(value);
        this.gObject.moveBackward(value);
    };
    
    /**
     * Move Sprite of "value" pixels upward.
     * if "value" is undefined, always move upward.
     * @param {Number} value
     */
    Robot.prototype._moveUpward = function(value) {
        if (typeof value === 'undefined') {
            value = this.step;
        }
        value = TUtils.getInteger(value);
        this.gObject.moveUpward(value);
    };
    
    /**
     * Move Sprite of "value" pixels downward.
     * if "value" is undefined, always move downward.
     * @param {Number} value
     */
    Robot.prototype._moveDownward = function(value) {
        if (typeof value === 'undefined') {
            value = this.step;
        }
        value = TUtils.getInteger(value);
        this.gObject.moveDownward(value);
    };
    
    /**
     * Move Sprite downward while nothing stops it.
     */
    Robot.prototype._alwaysMoveDownward = function() {
    };

    /**
     * Move Sprite upward while nothing stops it.
     */
    Robot.prototype._alwaysMoveUpward = function() {
    };

    /**
     * Move Sprite backward while nothing stops it.
     */
    Robot.prototype._alwaysMoveBackward = function() {
    };
    
    /**
     * Move Sprite forward while nothing stops it.
     */
    Robot.prototype._alwaysMoveForward = function() {
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

