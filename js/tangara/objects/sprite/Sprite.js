define(['jquery','TEnvironment', 'TUtils', 'CommandManager', 'TGraphicalObject'], function($, TEnvironment, TUtils, CommandManager, TGraphicalObject) {
    var Sprite = function(name) {
        TGraphicalObject.call(this);
        this.images = new Array();
        this.imageSets = new Array();
        this.transparentColors = new Array();
        this.displayedImage = "";
        this.displayedSet = "";
        this.displayedIndex = "";
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
    
    var qInstance = Sprite.prototype.qInstance;
        
    qInstance.TGraphicalObject.extend("TSprite", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                destinationX: 0,
                destinationY: 0,
                velocity:200,
                type:TGraphicalObject.TYPE_SPRITE,
                direction:'none',
                category:'',
                moving:false,
                hasCollisionCommands:false,
                collisionWatched:false,
                frozen:false
            },props),defaultProps);
            this.watchCollisions(true);
            this.encounteredObjects = new Array();
            this.lastEncounteredObjects = new Array();
            this.reciprocalCol = new Array();
        },
        checkCollisions: function() {
            if (this.p.moving) {
                // Look for other sprites
                this.encounteredObjects = [];
                this.reciprocalCol = false;
                var skip = 0;
                var collided = this.stage.TsearchSkip(this, TGraphicalObject.TYPE_SPRITE, skip);
                var collision = false, object;
                while(collided && !collision) {
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
                    object.trigger('hit',collided);
                    object.trigger('hit.sprite',collided);
                }
            }
        },
        objectEncountered: function(col) {
            if (this.p.hasCollisionCommands) {
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
            }
        },        
        step: function(dt) {
            var p = this.p;
            p.moving = false;
            if (!p.dragging && !p.frozen) {
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
        goTo: function(x,y) {
            this.perform(function(x,y){
                this.p.destinationX = x + this.p.w / 2;
                this.p.destinationY = y + this.p.h / 2;
                this.p.direction = Sprite.DIRECTION_NONE;
            }, [x,y]);
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
            return "Sprite_"+this.getId();
        },
        freeze: function(value) {
            this.p.frozen = value;
            this._super(value);
        },
        addTransparency: function(red, green, blue) {
            this.perform(function(red,green,blue) {
                var canvas = document.createElement('canvas');
                var asset = this.p.asset;
                var image = qInstance.asset(asset);
                var ctx = canvas.getContext('2d');
                var width = image.width;
                var height = image.height;
                canvas.width = width;
                canvas.height = height;
                this.p.transparencyMask = new Array();
                var mask = this.p.transparencyMask;
                var row=-1, col=width;
                ctx.drawImage(image, 0, 0 );
                var imageData = ctx.getImageData(0, 0, width, height);
                var data = imageData.data;
                for (var i=0;i<data.length;i+=4) {
                    col++;
                    if (col>=width) {
                        col = 0;
                        row++;
                        mask[row] = new Array();
                    }
                    var r=data[i];
                    var g=data[i+1];
                    var b=data[i+2];
                    if (r===red && g===green && b===blue) {
                        data[i+3] = 0;
                    }
                    mask[row][col] = (data[i+3] === 0)?true:false;
                }
                imageData.data = data;
                ctx.putImageData(imageData,0,0);
                image.src = canvas.toDataURL();
            }, [red, green, blue]);
        }
      });
    
    Sprite.prototype.qSprite = qInstance.TSprite;
    
    // MOVEMENT MANAGEMENT
    
    Sprite.prototype._moveForward = function(value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveForward();
        } else {
            value = TUtils.getInteger(value);
            this.qObject.moveForward(value);
        }
    };

    Sprite.prototype._alwaysMoveForward = function() {
        this.qObject.alwaysMoveForward();
    };

    Sprite.prototype._moveBackward = function(value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveBackward();
        } else {
            value = TUtils.getInteger(value);
            this.qObject.moveBackward(value);
        }
    };

    Sprite.prototype._alwaysMoveBackward = function() {
        this.qObject.alwaysMoveBackward();
    };
    
    Sprite.prototype._moveUpward = function(value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveUpward();
        } else {
            value = TUtils.getInteger(value);
            this.qObject.moveUpward(value);
        }
    };

    Sprite.prototype._alwaysMoveUpward = function() {
        this.qObject.alwaysMoveUpward();
    };

    Sprite.prototype._moveDownward = function(value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveDownward();
        } else {
            value = TUtils.getInteger(value);
            this.qObject.moveDownward(value);
        }
    };
    
    Sprite.prototype._alwaysMoveDownward = function() {
        this.qObject.alwaysMoveDownward();
    };

    Sprite.prototype._stop = function() {
        this.qObject.stop();
    };
    
    Sprite.prototype._setVelocity = function(value) {
        value = TUtils.getInteger(value);
        this.qObject.setVelocity(value);
    };
    
    // IMAGES MANAGEMENT
    
    Sprite.waitingForImage = new Array();
        
    Sprite.prototype._addImage = function(name, set) {
        name = TUtils.getString(name);
        // add image only if not already added
        if (typeof this.images[name] === 'undefined') {
            var asset = TEnvironment.getProjectResource(name);
            this.images[name] = asset;
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
            var loadedAsset = asset;
            qInstance.load(asset, function() {
                // Unregister onload event otherwise every transparency manipulation will call this
                // function again.
                var image = qInstance.asset(loadedAsset);
                image.onload = null;
                // store width and height as somehow, info may be lost afterwards (Safari)
                image.width = image.naturalWidth;
                image.height = image.naturalWidth;

                // 1st handle transparency
                // Note that transparency settings of current Sprite will affect image for every other Sprites
                // using the same asset
                if (spriteObject.transparentColors.length>0) {
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    var width = image.width;
                    var height = image.height;
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(image, 0, 0 );
                    var imageData = ctx.getImageData(0, 0, width, height);
                    var data = imageData.data;
                    var color;
                    for (var i=0;i<data.length;i+=4) {
                        var r=data[i];
                        var g=data[i+1];
                        var b=data[i+2];
                        for (var j=0; j<spriteObject.transparentColors.length;j++) {
                            color = spriteObject.transparentColors[j];
                            if (r===color[0] && g===color[1] && b===color[2]) {
                                data[i+3] = 0;
                            }
                        }
                    }
                    imageData.data = data;
                    ctx.putImageData(imageData,0,0);
                    image.onload = function() {
                        image.onload = null;
                        // 2nd set asset for all sprites waiting for this image
                        if (typeof Sprite.waitingForImage[name] !== 'undefined') {
                            // in case _displayImage was called while loading, set image for waiting sprites
                            while (Sprite.waitingForImage[name].length>0) {
                                var sprite = Sprite.waitingForImage[name].pop();
                                sprite.setDisplayedImage(name);
                            }
                            Sprite.waitingForImage[name] = undefined;
                        }
                    };
                    image.src = canvas.toDataURL();
                } else {
                    // 2nd set asset for all sprites waiting for this image
                    if (typeof Sprite.waitingForImage[name] !== 'undefined') {
                        // in case _displayImage was called while loading, set image for waiting sprites
                        while (Sprite.waitingForImage[name].length>0) {
                            var sprite = Sprite.waitingForImage[name].pop();
                            sprite.setDisplayedImage(name);
                        }
                        Sprite.waitingForImage[name] = undefined;
                    }
                }
            });
        }
    };
    
    Sprite.prototype.setDisplayedImage = function(name) {
        var asset = this.images[name];
        var qObject = this.qObject;
        this.displayedImage = name;
        // check if image actually loaded
        if (qInstance.assets[asset]) {
            qObject.asset(asset, true);
            if (!qObject.p.initialized) {
                qObject.initialized();
            }
            return true;
        } else {
            // otherwise, image will be displayed once loaded
            if (typeof Sprite.waitingForImage[name] === 'undefined') {
                Sprite.waitingForImage[name] = new Array();
            }
            Sprite.waitingForImage[name].push(this);
            return false;
        }
    };
    
    Sprite.prototype._displayImage = function(name) {
        name = TUtils.getString(name);
        if (typeof this.images[name] !== 'undefined') {
            if (this.displayedImage !== name) {
                this.setDisplayedImage(name);
            }
        } else {
            throw new Error(this.getMessage("resource not found", name));
        }
    };

    Sprite.prototype._displayNextImage = function(set) {
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

    Sprite.prototype._displayPreviousImage = function(set) {
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

    Sprite.prototype._setImage = function(name) {
        this._addImage(name);
        this._displayImage(name);
    };
    
    // COLLISION MANAGEMENT
    
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
    
    Sprite.prototype._setTransparent = function(red, green, blue) {
        var color = TUtils.getColor(red, green, blue);
        this.transparentColors.push(color);
        var canvas = document.createElement('canvas');
        var key;
        for (key in this.images) {
            if (this.images.hasOwnProperty(key)) {
                var asset = this.images[key];
                // check if image actually loaded
                if (qInstance.assets[asset]) {
                    var image = qInstance.asset(asset);
                    var ctx = canvas.getContext('2d');
                    var width = image.width;
                    var height = image.height;
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(image, 0, 0 );
                    var imageData = ctx.getImageData(0, 0, width, height);
                    var data = imageData.data;
                    for (var i=0;i<data.length;i+=4) {
                        var r=data[i];
                        var g=data[i+1];
                        var b=data[i+2];
                        if (r===color[0] && g===color[1] && b===color[2]) {
                            data[i+3] = 0;
                        }
                    }
                    imageData.data = data;
                    ctx.putImageData(imageData,0,0);
                    image.src = canvas.toDataURL();
                }
            }
        }
    };
    
    Sprite.prototype._goTo = function(x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.qObject.goTo(x,y);
    };

    Sprite.prototype._watchCollisions = function(value) {
        value = TUtils.getBoolean(value);
        this.qObject.watchCollisions(value);
    };
    
    Sprite.prototype.isReady = function(callback, arguments) {
        if (this.qObject.p.initialized) {
            return true;
        } else {
            if (typeof callback !== 'undefined') {
                this.qObject.perform(callback, arguments);
            }
            return false;
        }
    };    

    TEnvironment.internationalize(Sprite, true);
    
    return Sprite;
});



