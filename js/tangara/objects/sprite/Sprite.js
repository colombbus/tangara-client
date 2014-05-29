define(['jquery','TEnvironment', 'TUtils', 'CommandManager', 'TGraphicalObject'], function($, TEnvironment, TUtils, CommandManager, TGraphicalObject) {
    var Sprite = function(name) {
        window.console.log("Initializing sprite");
        TGraphicalObject.call(this);
        this.images = new Array();
        this.displayedImage = "";
        if (typeof name === 'string') {
          this._setImage(name);
        }
        this.id = Sprite.nextId++;
        this.qObject.id = this.id;
    };
    
    Sprite.prototype = Object.create(TGraphicalObject.prototype);
    Sprite.prototype.constructor = Sprite;
    Sprite.prototype.className = "Sprite";
    Sprite.nextId = 0;
    
    Sprite.DIRECTION_NONE = 0x00;
    Sprite.DIRECTION_LEFT = 0x01;
    Sprite.DIRECTION_RIGHT = 0x02;
    Sprite.DIRECTION_UP = 0x04;
    Sprite.DIRECTION_DOWN = 0x08;
    
    var qInstance = Sprite.prototype.qInstance;
    
    qInstance.TGraphicalObject.extend("TSprite", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                destinationX: 0,
                destinationY: 0,
                velocity:200,
                type:TGraphicalObject.TYPE_SPRITE,
                direction:'none',
                watchCollisions:false,
                category:'',
                moving:false
            },props),defaultProps);
        },
        checkCollisions: function() {
            if (this.p.watchCollisions && this.p.moving) {
                this.stage.collide(this, {collisionMask:TGraphicalObject.TYPE_SPRITE, maxCol:1});
            }
        },
        step: function(dt) {
            var p = this.p;
            p.moving = false;
            if (!p.dragging) {
                var step = p.velocity*dt;
                switch (p.direction) {
                    case Sprite.DIRECTION_NONE:
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
                        break;
                    case Sprite.DIRECTION_RIGHT:
                        p.x+=step;
                        p.moving = true;
                        break;
                    case Sprite.DIRECTION_LEFT:
                        p.x-=step;
                        p.moving = true;
                        break;
                    case Sprite.DIRECTION_UP:
                        p.y-=step;
                        p.moving = true;
                        break;
                    case Sprite.DIRECTION_DOWN:
                        p.y+=step;
                        p.moving = true;
                        break;
              }
              this.checkCollisions();
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
                this.p.direction = Sprite.DIRECTION_NONE;
            }, {});
        },
        setCenterLocation: function(x,y) {
            this._super(x,y);
            this.perform(function(){
                this.p.destinationX = this.p.x;this.p.destinationY = this.p.y;
                this.p.direction = Sprite.DIRECTION_NONE;
            }, {});
        },
        moveForward: function(value) {
            this.perform(function(value){
                this.p.destinationX+=value;
            }, [value]);
        },
        alwaysMoveForward: function() {
            this.perform(function(){
                this.p.direction = Sprite.DIRECTION_RIGHT;
            }, {});
        },
        moveBackward: function(value) {
            this.perform(function(value){
                this.p.destinationX-=value;
            }, [value]);
        },
        alwaysMoveBackward: function() {
            this.perform(function(){
                this.p.direction = Sprite.DIRECTION_LEFT;
            }, {});
        },
        moveUpward: function(value) {
            this.perform(function(value){
                this.p.destinationY-=value;
            }, [value]);
        },
        alwaysMoveUpward: function() {
            this.perform(function(){
                this.p.direction = Sprite.DIRECTION_UP;
            }, {});
        },
        moveDownward: function(value) {
            this.perform(function(value){
                this.p.destinationY+=value;
            }, [value]);
        },
        alwaysMoveDownward: function() {
            this.perform(function(){
                this.p.direction = Sprite.DIRECTION_DOWN;
            }, {});
        },
        stop: function() {
            this.perform(function(){
                this.p.destinationX = this.p.x;
                this.p.destinationY = this.p.y;
                this.p.direction = Sprite.DIRECTION_NONE;
            }, {});
        },
        setVelocity: function(value) {
            this.perform(function(value){
                this.p.velocity = value*2;
            }, [value]);
        },
        setCategory: function(name) {
            this.p.category = name;
        },
        getCategory: function() {
            return this.p.category;
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
            if (!this.p.watchCollisions) {
                this.on("hit", this, "objectEncountered");
                this.p.watchCollisions = true;
            }
        },
        objectEncountered: function(col) {
            // TODO add event object with info on collision
            var object = col.obj;
            if (typeof object.getId !== 'undefined') {
                var id = object.getId();
                var category = object.getCategory();
                // 1st check collision commands with this object
                if (typeof this.spriteCollisionCommands !== 'undefined' && this.spriteCollisionCommands.hasCommands(id)) {
                    this.spriteCollisionCommands.executeCommands({'field':id});
                }
                // 2nd check collision commands with object's category
                if (typeof this.categoryCollisionCommands !== 'undefined' && this.categoryCollisionCommands.hasCommands(category)) {
                    this.categoryCollisionCommands.executeCommands({'field':category});
                }
                // 3rd check general collision commands
                if (typeof this.collisionCommands !== 'undefined' && this.collisionCommands.hasCommands()) {
                    this.collisionCommands.executeCommands();
                }
            }
        },
        getId: function() {
            return this.id;
        },
        toString: function() {
            return "Sprite_"+this.id;
        },
        freeze: function(value) {
            //TODO: implement this
            this._super(value);
        }
      });
    
    Sprite.prototype.qSprite = qInstance.TSprite;
    
    // MOVEMENT MANAGEMENT
    
    Sprite.prototype._moveForward = function(value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveForward();
        }
        if (TUtils.checkInteger(value)) {
            this.qObject.moveForward(value);
        }
        return;
    };

    Sprite.prototype._alwaysMoveForward = function() {
        this.qObject.alwaysMoveForward();
        return;
    };

    Sprite.prototype._moveBackward = function(value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveBackward();
        }
        if (TUtils.checkInteger(value)) {
            this.qObject.moveBackward(value);
        }
        return;
    };

    Sprite.prototype._alwaysMoveBackward = function() {
        this.qObject.alwaysMoveBackward();
        return;
    };
    
    Sprite.prototype._moveUpward = function(value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveUpward();
        }
        if (TUtils.checkInteger(value)) {
            this.qObject.moveUpward(value);
        }
        return;
    };

    Sprite.prototype._alwaysMoveUpward = function() {
        this.qObject.alwaysMoveUpward();
        return;
    };

    Sprite.prototype._moveDownward = function(value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveDownward();
        }
        if (TUtils.checkInteger(value)) {
            this.qObject.moveDownward(value);
        }
        return;
    };
    
    Sprite.prototype._alwaysMoveDownward = function() {
        this.qObject.alwaysMoveDownward();
        return;
    };

    Sprite.prototype._stop = function() {
        this.qObject.stop();
        return;
    };
    
    Sprite.prototype._setVelocity = function(value) {
        if (TUtils.checkInteger(value)) {
            this.qObject.setVelocity(value);
        }
    };
    
    // IMAGES MANAGEMENT
    
    Sprite.waitingForImage = new Array();
        
    Sprite.prototype._addImage = function(name) {
        if (TUtils.checkString(name)) {
            // add image only if not already added
            if (typeof this.images[name] === 'undefined') {
                var asset = TEnvironment.getUserResource(name);
                this.images[name] = asset;
                window.console.log("loading asset '"+asset+"'");
                qInstance.load(asset, function() {
                    if (typeof Sprite.waitingForImage[name] !== 'undefined') {
                        // in case _displayImage was called while loading, set image for waiting sprites
                        while (Sprite.waitingForImage[name].length>0) {
                            var sprite = Sprite.waitingForImage[name].pop();
                            var qObject = sprite.qObject;
                            if (typeof sprite.images[sprite.displayedImage] !=='undefined' && qObject.p.asset !== sprite.images[sprite.displayedImage]) {
                                qObject.asset(sprite.images[sprite.displayedImage], true);
                                if (!qObject.p.initialized) {
                                    qObject.initialized();
                                }
                            }                            
                        }
                        Sprite.waitingForImage[name] = undefined;
                    }
                });
            }
        } else {
            throw new Error(this.getMessage("format error"));
        }
    };

    Sprite.prototype._displayImage = function(name) {
        if (TUtils.checkString(name) && typeof this.images[name] !== 'undefined') {
            if (this.displayedImage !== name) {
                window.console.log("displaying image '"+name+"'");
                var asset = this.images[name];
                var qObject = this.qObject;
                this.displayedImage = name;
                // check if image actually loaded
                if (qInstance.assets[asset]) {
                    qObject.asset(asset, true);
                    if (!qObject.p.initialized) {
                        qObject.initialized();
                    }
                } else {
                    // otherwise, image will be displayed once loaded
                    if (typeof Sprite.waitingForImage[name] === 'undefined') {
                        Sprite.waitingForImage[name] = new Array();
                    }
                    Sprite.waitingForImage[name].push(this);
                }
            }
        } else {
            throw new Error(TUtils.format(this.getMessage("resource not found"), name));
        }
    };

    Sprite.prototype._setImage = function(name) {
        this._addImage(name);
        this._displayImage(name);
    };
    
    // COLLISION MANAGEMENT
    
    Sprite.prototype._setCategory = function(name) {
        if (TUtils.checkString(name)) {
            this.qObject.setCategory(name);
        }
    };
    
    Sprite.prototype._ifCollision = function(param1, param2) {
        this.qObject.addCollisionCommand(param1, param2);
    };

    Sprite.prototype._ifCollisionWith = function(who, command) {
        this._ifCollision(command, who);
    };

    Sprite.prototype.toString = function() {
        return this.qObject.toString();
    };

    TEnvironment.internationalize(Sprite, true);
    
    return Sprite;
});



