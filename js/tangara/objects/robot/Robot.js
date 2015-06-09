define(['jquery','TEnvironment', 'TUtils', 'CommandManager', 'SynchronousManager', 'objects/hero/Hero'], function($, TEnvironment, TUtils, CommandManager, SynchronousManager, Hero) {
    var Robot = function() {
        Hero.call(this, "robot");
        this.step = 50;
        this.synchronousManager = new SynchronousManager();
        this.qObject.synchronousManager = this.synchronousManager;
        var qObject = this.qObject;
    };
    
    
    Robot.prototype = Object.create(Hero.prototype);
    Robot.prototype.constructor = Robot;
    Robot.prototype.className = "Robot";
    
    var qInstance = Robot.prototype.qInstance;
        
    qInstance.THero.extend("TRobot", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                inMovement:false,
                encountered:[],
                carriedItems:[]
            },props),defaultProps);
        },
        step: function(dt) {
            this._super(dt);
            var p = this.p;
            if (!p.dragging && !p.frozen) {
                if (p.moving) {
                    var x = p.x - p.w/2;
                    var y = p.y - p.h/2;
                    for (var i=0; i<p.carriedItems.length;i++) {
                        var item = p.carriedItems[i];
                        item.setLocation(x+i*10, y);
                    }
                }
                if (p.inMovement && !p.moving) {
                    p.inMovement = false;
                    this.synchronousManager.end();
                }
            }
        },
        moveForward: function(value) {
            this.perform(function(value){
                this.p.inMovement = true;
                this.synchronousManager.begin();
                this.p.destinationX+=value;
            }, [value]);
        },
        moveBackward: function(value) {
            this.perform(function(value){
                this.p.inMovement = true;
                this.synchronousManager.begin();
                this.p.destinationX-=value;
            }, [value]);
        },
        moveUpward: function(value) {
            this.perform(function(value){
                this.p.inMovement = true;
                this.synchronousManager.begin();
                this.p.destinationY-=value;
            }, [value]);
        },
        moveDownward: function(value) {
            this.perform(function(value){
                this.p.inMovement = true;
                this.synchronousManager.begin();
                this.p.destinationY+=value;
            }, [value]);
        },
        countItems: function() {
            var skip = 0;
            var collided = this.stage.TsearchSkip(this, TGraphicalObject.TYPE_ITEM, skip);
            var object;
            this.p.encountered = [];
            while(collided) {
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
            newItem.setLocation(this.p.x-this.p.w/2 + (this.p.carriedItems.length-1)*10, this.p.y-this.p.h/2);
        },
        dropItem: function() {
            if (this.p.carriedItems.length===0) {
                throw "no carried item";
            }
            this.p.carriedItems = this.p.carriedItems.slice(0,-1);
        },
        countCarriedItems: function() {
            return this.p.carriedItems.length;
        }
      });
    
    Robot.prototype.qSprite = qInstance.TRobot;
    
    // MOVEMENT MANAGEMENT
    
    Robot.prototype._moveForward = function(value) {
        if (typeof value === 'undefined') {
            value = this.step;
        }
        value = TUtils.getInteger(value);
        this.qObject.moveForward(value);
    };
    
    Robot.prototype._moveBackward = function(value) {
        if (typeof value === 'undefined') {
            value = this.step;
        }
        value = TUtils.getInteger(value);
        this.qObject.moveBackward(value);
    };

    Robot.prototype._moveUpward = function(value) {
        if (typeof value === 'undefined') {
            value = this.step;
        }
        value = TUtils.getInteger(value);
        this.qObject.moveUpward(value);
    };

    Robot.prototype._moveDownward = function(value) {
        if (typeof value === 'undefined') {
            value = this.step;
        }
        value = TUtils.getInteger(value);
        this.qObject.moveDownward(value);
    };
    
    Robot.prototype._alwaysMoveDownward = function () {
    };
    
    Robot.prototype._alwaysMoveUpward = function () {
    };

    Robot.prototype._alwaysMoveBackward = function () {
    };

    Robot.prototype._alwaysMoveForward = function () {
    };
        
    Robot.prototype._setStep = function(value) {
        value = TUtils.getInteger(value);
        this.step = value;
    };
    
    Robot.prototype._countItems = function() {
        //TODO: handle case where qObject not initialized yet
        return this.qObject.countItems();
    };

    Robot.prototype._pickupItem = function() {
        this.qObject.pickupItem();
    };
    
    Robot.prototype._dropItem = function() {
        this.qObject.dropItem();
    };

    Robot.prototype._countCarriedItems = function() {
        return this.qObject.countCarriedItems();
    };

    TEnvironment.internationalize(Robot, true);
    
    return Robot;
});

