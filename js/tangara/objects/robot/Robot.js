define(['jquery','TEnvironment', 'TUtils', 'CommandManager', 'SynchronousManager', 'TGraphicalObject'], function($, TEnvironment, TUtils, CommandManager, SynchronousManager, TGraphicalObject) {
    var Robot = function() {
        TGraphicalObject.call(this);
        this.step = 50;
        this.synchronousManager = new SynchronousManager();
        this.qObject.synchronousManager = this.synchronousManager;
        var qObject = this.qObject;
        var resource = this.getResource("robot.gif");
        qInstance.load(resource, function() {
            qObject.asset(resource, true);
            qObject.initialized();
        });
    };
    
    Robot.prototype = Object.create(TGraphicalObject.prototype);
    Robot.prototype.constructor = Robot;
    Robot.prototype.className = "Robot";
    
    var qInstance = Robot.prototype.qInstance;
        
    qInstance.TGraphicalObject.extend("TRobot", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                destinationX: 0,
                destinationY: 0,
                velocity:200,
                type:TGraphicalObject.TYPE_SPRITE,
                category:'',
                moving:false,
                hasCollisionCommands:false,
                collisionWatched:false,
                frozen:false,
                inMovement:false,
                encountered:[],
                carriedItems:[]
            },props),defaultProps);
            this.watchCollisions(true);
        },
        step: function(dt) {
            var p = this.p;
            p.moving = false;
            if (!p.dragging && !p.frozen) {
                var step = p.velocity*dt;
                if (p.x < p.destinationX) {
                    p.x = Math.min(p.x + step, p.destinationX);
                    p.moving = true;
                } else if (p.x > p.destinationX) {
                    p.x = Math.max(p.x - step, p.destinationX);
                    p.moving = true;
                }
                if (p.y < p.destinationY) {
                    p.y = Math.min(p.y + step, p.destinationY);
                    p.moving = true;
                } else if (p.y > p.destinationY) {
                    p.y = Math.max(p.y - step, p.destinationY);
                    p.moving = true;
                }
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
        designTouchEnd: function(touch) {
          this.p.destinationX = this.p.x;
          this.p.destinationY = this.p.y;
          this._super(touch);
        },
        setLocation: function(x,y) {
            this._super(x,y);
            this.perform(function(){
                this.p.destinationX = this.p.x;this.p.destinationY = this.p.y;
            }, {});
        },
        setCenterLocation: function(x,y) {
            this._super(x,y);
            this.perform(function(){
                this.p.destinationX = this.p.x;this.p.destinationY = this.p.y;
            }, {});
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
        setVelocity: function(value) {
            this.perform(function(value){
                this.p.velocity = value*2;
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
        },
        addCollisionCommand: function(command, param) {
            if (typeof param === 'undefined') {
                // collisions with all sprites
                if (typeof this.collisionCommands === 'undefined') {
                    this.collisionCommands = new CommandManager();
                }
                this.collisionCommands.addCommand(command);
            } else if (TUtils.checkString(param)) {
                // collision with a given category
                if (typeof this.categoryCollisionCommands === 'undefined') {
                    this.categoryCollisionCommands = new CommandManager();
                }            
                this.categoryCollisionCommands.addCommand(command, param);
            } else if (TUtils.checkObject(param)) {
                // collision with a given sprite
                if (typeof this.spriteCollisionCommands === 'undefined') {
                    this.spriteCollisionCommands = new CommandManager();
                }
                this.spriteCollisionCommands.addCommand(command, param.getQObject().getId());
            }
            if (!this.p.hasCollisionCommands) {
                this.p.hasCollisionCommands = true;
            }
        },
        watchCollisions: function(value) {
            this.perform(function(value){
                if (value === this.p.collisionWatched)
                    return;
                if (value) {
                    this.on("hit", this, "objectEncountered");
                } else {
                    this.off("hit", this, "objectEncountered");
                }
                this.p.collisionWatched = value;
            }, [value]);
        },
        getId: function() {
            return this.p.id;
        },
        toString: function() {
            return "Robot_"+this.getId();
        },
        freeze: function(value) {
            this.p.frozen = value;
            this._super(value);
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
    
    Robot.prototype._setVelocity = function(value) {
        value = TUtils.getInteger(value);
        this.qObject.setVelocity(value);
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

    // COLLISION MANAGEMENT
    /*
    Sprite.prototype._setCategory = function(name) {
        name = TUtils.getString(name);
        this.qObject.setCategory(name);
    };
    
    Sprite.prototype._ifCollision = function(param1, param2) {
        param1 = TUtils.getCommand(param1);
        this.qObject.addCollisionCommand(param1, param2);
    };

    Sprite.prototype._ifCollisionWith = function(who, command) {
        this._ifCollision(command, who);
    };

    Sprite.prototype.toString = function() {
        return this.qObject.toString();
    };
    
    Sprite.prototype._watchCollisions = function(value) {
        value = TUtils.getBoolean(value);
        this.qObject.watchCollisions(value);
    };*/

    TEnvironment.internationalize(Robot, true);
    
    return Robot;
});

