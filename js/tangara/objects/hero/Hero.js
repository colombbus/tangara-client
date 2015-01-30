define(['jquery','TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'objects/walker/Walker', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, Walker, TUtils) {
    var Hero = function(name) {
        Walker.call(this);
        if (typeof(name)==='undefined') {
            name = "tangy";
        }
        this.translatedForward = this.getMessage("forward");
        this.translatedBackward = this.getMessage("backward");
        this.translatedFront = this.getMessage("front");
        this.custom = false;
        this._setCharacter(name);
        
    };
    // TODO: use Quintus animations
    
    Hero.prototype = Object.create(Walker.prototype);
    Hero.prototype.constructor = Hero;
    Hero.prototype.className = "Hero";
    
    var qInstance = Hero.prototype.qInstance;
    
    qInstance.TWalker.extend("THero", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                dtMovement:1,
                dtPause:1,
                imgIndex:0,
                lastX:0,
                lastMove:Hero.DIRECTION_NONE,
                frontAssetsCount:0,
                forwardAssetsCount:0,
                backwardAssetsCount:0,
                defaultAssetsCount:0,
                durationMove:1,
                durationPause:1,
                ellapsed:0.0,
                autoAsset:true
            },props),defaultProps);
            this.frontAssets = [];
            this.forwardAssets = [];
            this.backwardAssets = [];
            this.defaultAssets = [];
            this.assetOperations = [];
            this.catchableObjects = {};
        },
        step: function(dt) {
            this._super(dt);
            var p = this.p;
            dt+=p.ellapsed;
            this.performAssetOperations();
            var deltaX = Math.round(p.x-p.lastX);
            if (p.autoAsset && !p.dragging && !p.frozen) {
                if (p.moving && deltaX !==0) {
                    // we are moving
                    if (dt>p.dtMovement) {
                        p.ellapsed = 0;
                        // display next image
                        if (deltaX > 0) {
                            // moving right
                            if (p.forwardAssetsCount > 0) {
                                if (p.lastMove === Sprite.DIRECTION_RIGHT) {
                                    p.imgIndex = (p.imgIndex+Math.round(dt/p.dtMovement)) % p.forwardAssetsCount;
                                } else {
                                    // direction changed
                                    p.imgIndex = 0;
                                }
                                p.asset = this.forwardAssets[p.imgIndex];
                                p.lastMove = Sprite.DIRECTION_RIGHT;
                            } else if (p.defaultAssetsCount > 0) {
                                p.imgIndex = (p.imgIndex+Math.round(dt/p.dtMovement)) % p.defaultAssetsCount;
                                p.asset = this.defaultAssets[p.imgIndex];
                            }
                        } else {
                            // moving left
                            if (p.backwardAssetsCount >0) {
                                if (p.lastMove === Sprite.DIRECTION_LEFT) {
                                    p.imgIndex = (p.imgIndex+Math.round(dt/p.dtMovement)) % p.backwardAssetsCount;
                                } else {
                                    // direction changed
                                    p.imgIndex = 0;
                                }
                                p.asset = this.backwardAssets[p.imgIndex];
                                p.lastMove = Sprite.DIRECTION_LEFT;
                            } else if (p.defaultAssetsCount > 0) {
                                p.imgIndex = (p.imgIndex+Math.round(dt/p.dtMovement)) % p.defaultAssetsCount;
                                p.asset = this.defaultAssets[p.imgIndex];
                            }
                        }
                    } else {
                        p.ellapsed = dt;
                    }
                } else if (p.initialized) {
                    // not moving forward nor backward
                    if (dt>p.dtPause) {
                        p.ellapsed = 0;
                        if (p.frontAssetsCount >0) {
                            if (p.lastMove === Sprite.DIRECTION_NONE) {
                                p.imgIndex = (p.imgIndex+Math.round(dt/p.dtPause)) % p.frontAssetsCount;
                            } else {
                                // direction changed
                                p.imgIndex = 0;
                            }
                            p.asset = this.frontAssets[p.imgIndex];
                            p.lastMove = Sprite.DIRECTION_NONE;
                        } else if (p.defaultAssetsCount > 0) {
                            p.imgIndex = (p.imgIndex+Math.round(dt/p.dtPause)) % p.defaultAssetsCount;
                            p.asset = this.defaultAssets[p.imgIndex];
                        }
                    } else {
                        p.ellapsed = dt;
                    }
                }
                p.lastX = p.x;
            }
        },
        setForwardAssets: function(assets) {
            this.addAssetOperation(function(assets) {
                this.forwardAssets = assets;
                this.p.forwardAssetsCount = assets.length;
            }, [assets], assets);
        },
        addForwardAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                this.forwardAssets.push(asset);
                this.p.forwardAssetsCount++;
            }, [asset], asset);
        },
        removeForwardAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                var index = this.forwardAssets.indexOf(asset);
                if (index >-1) {
                    this.forwardAssets.splice(index, 1);
                    this.p.forwardAssetsCount--;                
                }
            }, [asset]);
        },
        removeForwardAssets: function() {
            this.addAssetOperation(function() {
                this.forwardAssets = [];
                this.p.forwardAssetsCount = 0;
            }, []);
        },
        setBackwardAssets: function(assets) {
            this.addAssetOperation(function(assets) {
                this.backwardAssets = assets;
                this.p.backwardAssetsCount = assets.length;
            }, [assets], assets);
        },
        addBackwardAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                this.backwardAssets.push(asset);
                this.p.backwardAssetsCount++;
            }, [asset], asset);
        },
        removeBackwardAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                var index = this.backwardAssets.indexOf(asset);
                if (index >-1) {
                    this.backwardAssets.splice(index, 1);
                    this.p.backwardAssetsCount--;                
                }
            }, [asset]);
        },
        removeBackwardAssets: function() {
            this.addAssetOperation(function() {
                this.backwardAssets = [];
                this.p.backwardAssetsCount = 0;
            }, []);
        },
        setFrontAssets: function(assets) {
            this.addAssetOperation(function(value) {
                this.frontAssets = value;
                this.p.frontAssetsCount = value.length;
            }, [assets], assets);
        },
        addFrontAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                this.frontAssets.push(asset);
                this.p.frontAssetsCount++;
            }, [asset], asset);
        },
        removeFrontAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                var index = this.frontAssets.indexOf(asset);
                if (index >-1) {
                    this.frontAssets.splice(index, 1);
                    this.p.frontAssetsCount--;                
                }
            }, [asset]);
        },        
        removeFrontAssets: function() {
            this.addAssetOperation(function() {
                this.frontAssets = [];
                this.p.frontAssetsCount = 0;
            }, []);
        },
        setDefaultAssets: function(assets) {
            this.addAssetOperation(function(value) {
                this.defaultAssets = value;
                this.p.defaultAssetsCount = value.length;
            }, [assets], assets);
        },
        addDefaultAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                this.defaultAssets.push(asset);
                this.p.defaultAssetsCount++;
            }, [asset], asset);
        },
        removeDefaultAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                var index = this.defaultAssets.indexOf(asset);
                if (index >-1) {
                    this.defaultAssets.splice(index, 1);
                    this.p.defaultAssetsCount--;                
                }
            }, [asset]);
        },        
        removeDefaultAssets: function() {
            this.addAssetOperation(function() {
                this.defaultAssets = [];
                this.p.defaultAssetsCount = 0;
            }, []);
        },        
        setVelocity: function(value) {
            this._super(value);
            // compute base dt
            this.computeDts();
        },
        setDurations: function(valueMove, valuePause) {
            this.p.durationMove = valueMove;
            this.p.durationPause = valuePause;
            this.computeDts();
        },
        setMovementDuration: function(value) {
            this.p.durationMove = value;
            this.computeDts();            
        },
        setPauseDuration: function(value) {
            this.p.durationPause = value;
            this.computeDts();            
        },
        computeDts: function() {
            this.addAssetOperation(function() {
                var p = this.p;
                if (p.forwardAssetsCount>0) {
                    // we assume that forwardAssetsCount is equal to backwardAssetsCount
                    p.dtMovement = (p.durationMove/p.forwardAssetsCount)*200/p.velocity;
                } else if (p.defaultAssetsCount>0) {
                    // we assume that forwardAssetsCount is equal to backwardAssetsCount
                    p.dtMovement = (p.durationMove/p.defaultAssetsCount)*200/p.velocity;
                }
                if (p.frontAssetsCount>0) {
                    p.dtPause = (p.durationPause/p.frontAssetsCount)*200/p.velocity;
                } else if (p.defaultAssetsCount>0) {
                    // we assume that forwardAssetsCount is equal to backwardAssetsCount
                    p.dtPause = (p.durationPause/p.defaultAssetsCount)*200/p.velocity;
                }
            }, []);
        },

        addAssetOperation: function(action, parameters, asset) {
            if (typeof asset === 'undefined') {
                this.assetOperations.push([action, parameters]);
            } else {
                this.assetOperations.push([action, parameters, asset]);
            }
                
        },
        
        performAssetOperations: function() {
            while (this.assetOperations.length>0) {
                var operation = this.assetOperations[0];
                var test = true;
                if (operation.length>2) {
                    // This operation require a test on assets first
                    var asset = operation[2];
                    if (asset instanceof Array) {
                        // several assets have to be checked
                        for (var i = 0; i<asset.length; i++) {
                            if (!qInstance.assets[asset[i]]) {
                                // one of the assets is not loaded yet
                                test = false;
                                break;
                            }
                        }
                    } else if (!qInstance.assets[asset]) {
                        // only one asset has to be checked: not loaded
                        test = false;
                    }
                }
                if (!test) {
                    // Assets are missing: we break here
                    break;
                }
                this.assetOperations.shift();
                operation[0].apply(this, operation[1]);
            }
        },
        
        stopAutoAsset: function() {
            this.p.autoAsset = false;
        },

        startAutoAsset: function() {
            this.p.autoAsset = true;
        },
        
        mayCatch: function(object) {
            var id = object.getQObject().getId();
            if (typeof (this.catchableObjects[id]) === 'undefined') {
                this.catchableObjects[id] = object;
            }
        },
        objectEncountered: function(col) {
            this._super(col);
            var object = col.obj;
            if (typeof object.getId !== 'undefined') {
                var id = object.getId();
                if (typeof (this.catchableObjects[id]) !== 'undefined') {
                    this.catchableObjects[id]._delete();
                }
            }
        }


    });
    
    Hero.prototype.qSprite = qInstance.THero;
    
    Hero.prototype._setCharacter = function(name) {
        name = TUtils.getString(name);
        name = this.getMessage(name);
        var baseCharacterUrl = this.getResource(name)+"/";
        var configUrl = baseCharacterUrl+"config.json";
        var parent = this;
        $.ajax({
            dataType: "json",
            url: configUrl,
            async: false,
            success: function(data) {
                var currentLocation = false;
                if (parent.qObject.p.initialized) {
                    currentLocation = parent.qObject.getLocation();
                }
                var frontImages = data['images']['front'];
                var frontAssets = [];
                try {
                    parent._removeImageSet(parent.translatedFront);
                } catch (e) {}
                for (var i=0; i<frontImages.length; i++) {
                    frontAssets.push(parent.addImage(name+"/"+frontImages[i], parent.translatedFront, false));
                }
                parent.qObject.setFrontAssets(frontAssets);
                var forwardImages = data['images']['forward'];
                var forwardAssets = [];
                try {
                    parent._removeImageSet(parent.translatedForward);
                } catch (e) {}
                for (var i=0; i<forwardImages.length; i++) {
                    forwardAssets.push(parent.addImage(name+"/"+forwardImages[i], parent.translatedForward, false));
                }
                parent.qObject.setForwardAssets(forwardAssets);
                var backwardImages = data['images']['backward'];
                var backwardAssets = [];
                try {
                    parent._removeImageSet(parent.translatedBackward);
                } catch (e) {}
                for (var i=0; i<backwardImages.length; i++) {
                    backwardAssets.push(parent.addImage(name+"/"+backwardImages[i], parent.translatedBackward, false));
                }
                parent.qObject.setBackwardAssets(backwardAssets);
                // remove default imageSet
                try {
                    parent._removeImageSet("");
                } catch (e) {}
                parent.qObject.removeDefaultAssets();
                // set initialized to false, to be sure that location will be set after next image is displayed
                // (and width and height are correctly set)
                parent.qObject.p.initialized = false;
                parent._displayNextImage(parent.translatedFront);
                if (currentLocation !== false) {
                    parent.qObject.setLocation(currentLocation.x, currentLocation.y);
                }
                parent.qObject.setDurations(data['durationMove'], data['durationPause']);
                parent.custom = false;
            }
        }).fail(function(jqxhr, textStatus, error) {
            throw new Error(TUtils.format(parent.getMessage("unknwon character"), name));
        });

    };
    
    Hero.prototype.checkSet = function(set) {
        var specialSet = false;
        if (typeof set !== 'undefined') {
            set = TUtils.getString(set);
            if (set === this.translatedFront) {
                specialSet = "front";
            } else if (set === this.translatedBackward) {
                specialSet = "backward";
            } else if (set === this.translatedForward) {
                specialSet = "forward";
            } else if (set === "") {
                specialSet = "default";
            }
        } else {
            specialSet = "default";
        }
        return specialSet;
    };
    
    Hero.prototype._addImage = function(name, set) {
        var specialSet = this.checkSet(set);
        var currentLocation = false;
        if (!this.custom && specialSet !== false) {
            // We begin to customize: we remove default sets
            try {
                this._removeImageSet(this.translatedFront);                    
            } catch (e) {}
            try {
                this._removeImageSet(this.translatedForward);
            } catch (e) {}
            try {
                this._removeImageSet(this.translatedBackward);
            } catch (e) {}
            try {
                this._removeImageSet("");
            } catch (e) {}
            if (this.qObject.p.initialized) {
                currentLocation = this.qObject.getLocation();
            }
        }
        var asset = this.addImage(name, set, true);
        if (specialSet !== false) {
            switch (specialSet) {
                case "front":
                    this.qObject.addFrontAsset(asset);
                    break;
                case "backward":
                    this.qObject.addBackwardAsset(asset);
                    break;
                case "forward":
                    this.qObject.addForwardAsset(asset);
                    break;
                case "default":
                    this.qObject.addDefaultAsset(asset);
                    break;
            }
            this.qObject.computeDts();
            if (!this.custom) {
                this.custom = true;
                this.qObject.p.initialized = false;
                this._displayNextImage(set);
                if (currentLocation !== false) {
                    this.qObject.setLocation(currentLocation.x, currentLocation.y);
                }
            }
        }
    };
    
    Hero.prototype._stopAutoAsset = function() {
        this.qObject.stopAutoAsset();
    };

    Hero.prototype._startAutoAsset = function() {
        this.qObject.startAutoAsset();
    };
    
    Hero.prototype._removeImage = function (name, set) {
        var specialSet = this.checkSet(set);
        var asset = this.removeImage(name, set);
        if (specialSet !== false) {
            switch (specialSet) {
                case "front":
                    this.qObject.removeFrontAsset(asset);
                    break;
                case "backward":
                    this.qObject.removeBackwardAsset(asset);
                    break;
                case "forward":
                    this.qObject.removeForwardAsset(asset);
                    break;
                case "default":
                    this.qObject.removeDefaultAsset(asset);
                    break;
            }
            this.qObject.computeDts();
        }
    };
    
    Hero.prototype._removeImageSet = function (name) {
        var specialSet = this.checkSet(name);
        Sprite.prototype._removeImageSet.call(this, name);
        if (specialSet !== false) {
            switch (specialSet) {
                case "front":
                    this.qObject.removeFrontAssets();
                    break;
                case "backward":
                    this.qObject.removeBackwardAssets();
                    break;
                case "forward":
                    this.qObject.removeForwardAssets();
                    break;
                case "default":
                    this.qObject.removeDefaultAssets();
                    break;
            }
            this.qObject.computeDts();
        }
    };
    
    Hero.prototype._setMovementDuration = function(value) {
        value = TUtils.getInteger(value);
        this.qObject.setMovementDuration(value/1000);
    };
    
    Hero.prototype._setPauseDuration = function(value) {
        value = TUtils.getInteger(value);
        this.qObject.setPauseDuration(value/1000);
    };
    
    Hero.prototype._addScene = function(object) {
        this._addBlock(object);
    };
    
    Hero.prototype._mayCatch = function(object) {
        object = TUtils.getObject(object);
        this.qObject.mayCatch(object);
    };
    
    Hero.prototype._ifCatch = function(object, command) {
        object = TUtils.getObject(object);
        command = TUtils.getString(command);
        this.qObject.mayCatch(object);
        this.qObject.addCollisionCommand(command, object);
    };

    TEnvironment.internationalize(Hero, true);
    
    return Hero;
});