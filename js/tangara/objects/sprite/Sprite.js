define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'ResourceManager', 'TGraphicalObject'], function ($, TEnvironment, TUtils, CommandManager, ResourceManager, TGraphicalObject) {
    var Sprite = function (name) {
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

    Sprite.DIRECTION_NONE = 0x00;
    Sprite.DIRECTION_LEFT = 0x01;
    Sprite.DIRECTION_RIGHT = 0x02;
    Sprite.DIRECTION_UP = 0x04;
    Sprite.DIRECTION_DOWN = 0x08;

    var graphics = Sprite.prototype.graphics;

    Sprite.prototype.gClass = graphics.addClass("TGraphicalObject", "TSprite", {
        init: function (props, defaultProps) {
            this._super(TUtils.extend({
                destinationX: 0,
                destinationY: 0,
                velocity: 200,
                type: TGraphicalObject.TYPE_SPRITE,
                direction: 'none',
                category: '',
                moving: false,
                hasCollisionCommands: false,
                collisionWatched: false,
                frozen: false,
                asset: null
            }, props), defaultProps);
            this.watchCollisions(true);
            this.encounteredObjects = new Array();
            this.lastEncounteredObjects = new Array();
            this.reciprocalCol = new Array();
            this.resources = {};
        },
        setResources: function(r) {
            this.resources = r;
        },
        asset: function(name,resize) {
            if(!name) { 
                if (this.p.asset) {
                    return this.resources.getUnchecked(this.p.asset);
                } else {
                    return null;
                }
            }
            this.p.asset = name;
            if(resize) {
	            graphics.objectResized(this);
            }
        },
        removeAsset: function() {
            this.p.asset = null;
            this.p.initialized = false;
        },
        draw: function(ctx) {
            var p = this.p;
            if(p.sheet) {
              this.sheet().draw(ctx,-p.cx,-p.cy,p.frame);
            } else if(p.asset) {
              ctx.drawImage(this.resources.getUnchecked(p.asset),-p.cx,-p.cy);
            } else if(p.color) {
              ctx.fillStyle = p.color;
              ctx.fillRect(-p.cx,-p.cy,p.w,p.h);
            }
        },       
        checkCollisions: function () {
            if (this.p.moving) {
                // Look for other sprites
                this.encounteredObjects = [];
                this.reciprocalCol = false;
                var skip = 0;
                var collided = this.stage.TsearchSkip(this, TGraphicalObject.TYPE_SPRITE, skip);
                var collision = false, object;
                while (collided && !collision) {
                    object = collided.obj;
                    this.encounteredObjects.push(object);
                    if (this.lastEncounteredObjects.indexOf(object) === -1) {
                        this.objectEncountered(collided);
                        collision = true;
                    } else {
                        // look for another sprite
                        skip++;
                        collided = this.stage.TsearchSkip(this, TGraphicalObject.TYPE_SPRITE, skip);
                    }
                }
                this.lastEncounteredObjects = this.encounteredObjects.slice(0);
                if (collision) {
                    // Do the reciprical collision
                    collided.obj = this;
                    collided.normalX *= -1;
                    collided.normalY *= -1;
                    collided.distance = 0;
                    collided.magnitude = 0;
                    collided.separate[0] = 0;
                    collided.separate[1] = 0;
                    object.trigger('hit', collided);
                    object.trigger('hit.sprite', collided);
                }
            }
        },
        objectEncountered: function (col) {
            if (this.p.collisionWatched && this.p.hasCollisionCommands) {
                // TODO add event object with info on collision
                var object = col.obj;
                if (typeof object.getId !== 'undefined') {
                    var id = object.getId();
                    var category = object.getCategory();
                    // 1st check collision commands with this object
                    if (typeof this.spriteCollisionCommands !== 'undefined' && this.spriteCollisionCommands.hasCommands(id)) {
                        this.spriteCollisionCommands.executeCommands({'field': id});
                    }
                    // 2nd check collision commands with object's category
                    if (typeof this.categoryCollisionCommands !== 'undefined' && this.categoryCollisionCommands.hasCommands(category)) {
                        this.categoryCollisionCommands.executeCommands({'field': category});
                    }
                    // 3rd check general collision commands
                    if (typeof this.collisionCommands !== 'undefined' && this.collisionCommands.hasCommands()) {
                        this.collisionCommands.executeCommands();
                    }
                }
            }
        },
        step: function (dt) {
            var p = this.p;
            p.moving = false;
            if (!p.dragging && !p.frozen) {
                var step = p.velocity * dt;
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
                        p.x += step;
                        p.moving = true;
                        break;
                    case Sprite.DIRECTION_LEFT:
                        p.x -= step;
                        p.moving = true;
                        break;
                    case Sprite.DIRECTION_UP:
                        p.y -= step;
                        p.moving = true;
                        break;
                    case Sprite.DIRECTION_DOWN:
                        p.y += step;
                        p.moving = true;
                        break;
                }
                this.checkCollisions();
            }
        },
        designTouchEnd: function (touch) {
            this.p.destinationX = this.p.x;
            this.p.destinationY = this.p.y;
            this._super(touch);
        },
        setLocation: function (x, y) {
            this._super(x, y);
            this.perform(function () {
                this.p.destinationX = this.p.x;
                this.p.destinationY = this.p.y;
                this.p.direction = Sprite.DIRECTION_NONE;
            }, {});
        },
        setCenterLocation: function (x, y) {
            this._super(x, y);
            this.perform(function () {
                this.p.destinationX = this.p.x;
                this.p.destinationY = this.p.y;
                this.p.direction = Sprite.DIRECTION_NONE;
            }, {});
        },
        moveForward: function (value) {
            this.perform(function (value) {
                this.p.destinationX += value;
            }, [value]);
        },
        alwaysMoveForward: function () {
            this.perform(function () {
                this.p.direction = Sprite.DIRECTION_RIGHT;
            }, {});
        },
        moveBackward: function (value) {
            this.perform(function (value) {
                this.p.destinationX -= value;
            }, [value]);
        },
        alwaysMoveBackward: function () {
            this.perform(function () {
                this.p.direction = Sprite.DIRECTION_LEFT;
            }, {});
        },
        moveUpward: function (value) {
            this.perform(function (value) {
                this.p.destinationY -= value;
            }, [value]);
        },
        alwaysMoveUpward: function () {
            this.perform(function () {
                this.p.direction = Sprite.DIRECTION_UP;
            }, {});
        },
        moveDownward: function (value) {
            this.perform(function (value) {
                this.p.destinationY += value;
            }, [value]);
        },
        alwaysMoveDownward: function () {
            this.perform(function () {
                this.p.direction = Sprite.DIRECTION_DOWN;
            }, {});
        },
        goTo: function (x, y) {
            this.perform(function (x, y) {
                this.p.destinationX = x + this.p.w / 2;
                this.p.destinationY = y + this.p.h / 2;
                this.p.direction = Sprite.DIRECTION_NONE;
            }, [x, y]);
        },
        centerGoTo: function (x, y) {
            this.perform(function (x, y) {
                this.p.destinationX = x;
                this.p.destinationY = y;
                this.p.direction = Sprite.DIRECTION_NONE;
            }, [x, y]);
        },
        stop: function () {
            this.perform(function () {
                this.p.destinationX = this.p.x;
                this.p.destinationY = this.p.y;
                this.p.direction = Sprite.DIRECTION_NONE;
            }, {});
        },
        setVelocity: function (value) {
            this.perform(function (value) {
                this.p.velocity = value * 2;
            }, [value]);
        },
        setCategory: function (name) {
            this.p.category = name;
        },
        getCategory: function () {
            return this.p.category;
        },
        addCollisionCommand: function (command, param) {
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
                this.spriteCollisionCommands.addCommand(command, param.getgObject().getId());
            }
            if (!this.p.hasCollisionCommands) {
                this.p.hasCollisionCommands = true;
            }
        },
        watchCollisions: function (value) {
            this.perform(function (value) {
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
        getId: function () {
            return this.p.id;
        },
        toString: function () {
            return "Sprite_" + this.getId();
        },
        freeze: function (value) {
            this.p.frozen = value;
            this._super(value);
        }
    });

    // MOVEMENT MANAGEMENT

    Sprite.prototype._moveForward = function (value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveForward();
        } else {
            value = TUtils.getInteger(value);
            this.gObject.moveForward(value);
        }
    };

    Sprite.prototype._alwaysMoveForward = function () {
        this.gObject.alwaysMoveForward();
    };

    Sprite.prototype._moveBackward = function (value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveBackward();
        } else {
            value = TUtils.getInteger(value);
            this.gObject.moveBackward(value);
        }
    };

    Sprite.prototype._alwaysMoveBackward = function () {
        this.gObject.alwaysMoveBackward();
    };

    Sprite.prototype._moveUpward = function (value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveUpward();
        } else {
            value = TUtils.getInteger(value);
            this.gObject.moveUpward(value);
        }
    };

    Sprite.prototype._alwaysMoveUpward = function () {
        this.gObject.alwaysMoveUpward();
    };

    Sprite.prototype._moveDownward = function (value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveDownward();
        } else {
            value = TUtils.getInteger(value);
            this.gObject.moveDownward(value);
        }
    };

    Sprite.prototype._alwaysMoveDownward = function () {
        this.gObject.alwaysMoveDownward();
    };

    Sprite.prototype._stop = function () {
        this.gObject.stop();
    };

    Sprite.prototype._setVelocity = function (value) {
        value = TUtils.getInteger(value);
        this.gObject.setVelocity(value);
    };

    // IMAGES MANAGEMENT

    Sprite.waitingForImage = new Array();

    Sprite.prototype._addImage = function (name, set) {
        this.addImage(name, set, true);
    };

    Sprite.prototype.addImage = function (name, set, project, callback) {
        name = TUtils.getString(name);
        var asset;
        try {
            if (project) {
                // asset from project
                asset = TEnvironment.getProjectResource(name);
            } else {
                // asset from object itself
                asset = this.getResource(name);
            }
            if (typeof set === 'undefined') {
                set = "";
            } else {
                set = TUtils.getString(set);
            }
            if (typeof this.imageSets[set] === 'undefined') {
                this.imageSets[set] = new Array();
            }
            this.imageSets[set].push(name);        
            var spriteObject = this;
            this.resources.add(name, asset, function() {
                if (name === spriteObject.waitingForImage) {
                    spriteObject.setDisplayedImage(name);
                }
                if (typeof callback !== 'undefined') {
                    callback.call(spriteObject);
                }
            });
        }
        catch (e) {
            throw new Error(this.getMessage("file not found", name));
        }
    };
    
    Sprite.prototype._removeImage = function (name, set) {
        this.removeImage(name, set);
    };

    Sprite.prototype.removeImage = function (name, set) {
        if (typeof set === 'undefined') {
            set = "";
        } else {
            set = TUtils.getString(set);
        }
        name = TUtils.getString(name);
        if (typeof this.imageSets[set] === 'undefined') {
            throw new Error(this.getMessage("wrong set"));
        }

        var index = this.imageSets[set].indexOf(name);

        if (index < 0) {
            throw new Error(this.getMessage("resource not found", name));
        }

        this.imageSets[set].splice(index, 1);
        
        // if sprite was waiting for this image, remove it
        if (this.waitingForImage === name) {
            this.waitingForImage = '';
        }
        // if removed image was current image, remove asset
        if (this.displayedImage === name) {
            // remove asset
            this.gObject.removeAsset();
            this.displayedImage = null;
            this.displayedIndex = 0;
        }
        
        // TODO: remove from  images ONLY IF image not used in other set
        this.resources.remove(name);
    };

    Sprite.prototype._removeImageSet = function (name) {
        if (typeof name === 'undefined') {
            name = "";
        }
        name = TUtils.getString(name);

        if (typeof this.imageSets[name] === 'undefined') {
            throw new Error(this.getMessage("wrong set"));
        }

        this.emptyImageSet(name);

        delete this.imageSets[name];
        if (this.displayedSet === name) {
            // set was the currently used: remove image from sprite
            this.gObject.removeAsset();
            this.displayedImage = null;
            this.displayedSet = "";
            this.displayedIndex = 0;
        }
    };

    Sprite.prototype.emptyImageSet = function (name) {
        for (var i = 0; i < this.imageSets[name].length; i++) {
            var imageName = this.imageSets[name][i];
            // if sprite was waiting for this image, remove it
            if (this.waitingForImage === imageName) {
                this.waitingForImage = '';
            }
            // if removed image was current image, remove image
            if (this.displayedImage === imageName) {
                // remove asset
                this.gObject.removeAsset();
                this.displayedImage = null;
                this.displayedIndex = 0;
            }

            this.resources.remove(name);
        }
    };

    Sprite.prototype.setDisplayedImage = function (name) {
        this.displayedImage = name;
        if (this.resources.ready(name)) {
            // image ready
            var gObject = this.gObject;
            gObject.asset(name, true);
            if (!gObject.p.initialized) {
                gObject.initialized();
            }
            return true;
        } else {
            // image not ready
            this.waitingForImage = name;
            return false;
        }
    };

    Sprite.prototype._displayImage = function (name) {
        name = TUtils.getString(name);
        if (!this.resources.has(name)) {
            throw new Error(this.getMessage("resource not found", name));
        }
        if (this.displayedImage !== name) {
            this.setDisplayedImage(name);
        }
    };

    Sprite.prototype._displayNextImage = function (set) {
        if (typeof set === 'undefined') {
            set = "";
        } else {
            set = TUtils.getString(set);
        }
        if (typeof this.imageSets[set] === 'undefined') {
            throw new Error(this.getMessage("wrong set"));
        }
        if (this.displayedSet === set) {
            // We are in the same set: get next image
            this.displayedIndex = (this.displayedIndex + 1) % this.imageSets[set].length;
            this._displayImage(this.imageSets[set][this.displayedIndex]);
        } else {
            // We are changing set: start at 0
            this.displayedIndex = 0;
            this.displayedSet = set;
            this._displayImage(this.imageSets[set][0]);
        }
    };

    Sprite.prototype._displayPreviousImage = function (set) {
        if (typeof set === 'undefined') {
            set = "";
        } else {
            set = TUtils.getString(set);
        }
        if (typeof this.imageSets[set] === 'undefined') {
            throw new Error(this.getMessage("wrong set"));
        }
        if (this.displayedSet === set) {
            // We are in the same set: get next image
            this.displayedIndex = (this.displayedIndex - 1 + this.imageSets[set].length) % this.imageSets[set].length;
            this._displayImage(this.imageSets[set][this.displayedIndex]);
        } else {
            // We are changing set: start at 0
            this.displayedIndex = 0;
            this.displayedSet = set;
            this._displayImage(this.imageSets[set][0]);
        }
    };

    Sprite.prototype._setImage = function (name) {
        this._addImage(name);
        this._displayImage(name);
    };

    // COLLISION MANAGEMENT

    Sprite.prototype._setCategory = function (name) {
        name = TUtils.getString(name);
        this.gObject.setCategory(name);
    };

    Sprite.prototype._ifCollision = function (param1, param2) {
        param1 = TUtils.getCommand(param1);
        this.gObject.addCollisionCommand(param1, param2);
    };

    Sprite.prototype._ifCollisionWith = function (who, command) {
        this._ifCollision(command, who);
    };

    Sprite.prototype.toString = function () {
        return this.gObject.toString();
    };
    
    Sprite.prototype.setTransparent = function (red, green, blue, callbacks) {
        var color = TUtils.getColor(red, green, blue);
        this.resources.addTransparentColor(color, callbacks);
    };

    Sprite.prototype._setTransparent = function (red, green, blue) {
        if (this.displayedImage) {
            this.gObject.removeAsset();
        }
        var parent = this;
        this.setTransparent(red, green, blue, function(name) {
            if (parent.displayedImage === name) {
                parent.setDisplayedImage(name);
            }
        });
    };

    Sprite.prototype.couleurTransparente = function (red, green, blue) {
        this._setTransparent(red, green, blue);
    };
    Sprite.prototype._goTo = function (x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.gObject.goTo(x, y);
    };

    Sprite.prototype._centerGoTo = function (x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.gObject.centerGoTo(x, y);
    };

    Sprite.prototype._watchCollisions = function (value) {
        value = TUtils.getBoolean(value);
        this.gObject.watchCollisions(value);
    };

    Sprite.prototype.isReady = function (callback, arguments) {
        if (this.gObject.p.initialized) {
            return true;
        } else {
            if (typeof callback !== 'undefined') {
                this.gObject.perform(callback, arguments);
            }
            return false;
        }
    };

    TEnvironment.internationalize(Sprite, true);

    return Sprite;
});



