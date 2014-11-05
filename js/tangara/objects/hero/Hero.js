define(['jquery','TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'objects/walker/Walker', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, Walker, TUtils) {
    var Hero = function(name) {
        Walker.call(this);
        if (typeof(name)==='undefined') {
            name = "tangy";
        }
        this._setCharacter(name);
    };
    
    Hero.prototype = Object.create(Walker.prototype);
    Hero.prototype.constructor = Hero;
    Hero.prototype.className = "Hero";
    
    var qInstance = Hero.prototype.qInstance;
    
    qInstance.TWalker.extend("THero", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                dtMovement:0,
                dtPause:0,
                imgIndex:0,
                lastX:0,
                lastMove:Hero.DIRECTION_NONE,
                frontAssetsCount:0,
                forwardAssetsCount:0,
                backwardAssetsCount:0,
                durationMove:0,
                durationPause:0,
                ellapsed:0.0
            },props),defaultProps);
            this.frontAssets = [];
            this.forwardAssets = [];
            this.backwardAssets = [];
        },
        step: function(dt) {
            this._super(dt);
            var p = this.p;
            dt+=p.ellapsed;
            if (p.moving && p.x !== p.lastX) {
                // we are moving
                if (dt>p.dtMovement) {
                    p.ellapsed = 0;
                    // display next image
                    if (p.x > p.lastX && p.frontAssetsCount > 0) {
                        // moving right
                        if (p.lastMove === Sprite.DIRECTION_RIGHT) {
                            p.imgIndex = Math.round(p.imgIndex+1) % p.forwardAssetsCount;
                        } else {
                            // direction changed
                            p.imgIndex = 0;
                        }
                        this.asset(this.forwardAssets[p.imgIndex], false);
                        p.lastMove = Sprite.DIRECTION_RIGHT;
                    } else if (p.backwardAssetsCount >0) {
                        // moving left
                        if (p.lastMove === Sprite.DIRECTION_LEFT) {
                            p.imgIndex = Math.round(p.imgIndex+1) % p.backwardAssetsCount;
                        } else {
                            // direction changed
                            p.imgIndex = 0;
                        }
                        this.asset(this.backwardAssets[p.imgIndex], false);
                        p.lastMove = Sprite.DIRECTION_LEFT;
                    }
                } else {
                    p.ellapsed = dt;
                }
            } else {
                // not moving forward nor backward
                if (dt>p.dtPause) {
                    p.ellapsed = 0;
                    if (p.frontAssetsCount >0) {
                        if (p.lastMove === Sprite.DIRECTION_NONE) {
                            p.imgIndex = (p.imgIndex+1) % p.frontAssetsCount;
                        } else {
                            // direction changed
                            p.imgIndex = 0;
                        }
                        this.asset(this.frontAssets[p.imgIndex], false);
                    }
                    p.lastMove = Sprite.DIRECTION_NONE;
                } else {
                    p.ellapsed = dt;
                }
            }
            p.lastX = p.x;
        },
        setForwardAssets: function(assets) {
            this.forwardAssets = assets;
            this.p.forwardAssetsCount = assets.length;
        },
        setBackwardAssets: function(assets) {
            this.backwardAssets = assets;
            this.p.backwardAssetsCount = assets.length;
        },
        setFrontAssets: function(assets) {
            this.frontAssets = assets;
            this.p.frontAssetsCount = assets.length;
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
        computeDts: function() {
            var p = this.p;
            if (p.forwardAssetsCount>0) {
                // we assume that forwardAssetsCount is equal to backwardAssetsCount
                p.dtMovement = (p.durationMove/p.forwardAssetsCount)*200/p.velocity;
            }
            if (p.frontAssetsCount>0) {
                p.dtPause = (p.durationPause/p.frontAssetsCount)*200/p.velocity;
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
            async: true,
            success: function(data) {
                var frontTranslated = TEnvironment.getMessage("front");
                var frontImages = data['images']['front'];
                var frontAssets = [];
                try {
                    parent._removeImageSet(frontTranslated);
                } catch (e) {}
                for (var i=0; i<frontImages.length; i++) {
                    frontAssets.push(parent.addImage(name+"/"+frontImages[i], frontTranslated, false));
                }
                parent.qObject.setFrontAssets(frontAssets);
                var forwardTranslated = TEnvironment.getMessage("forward");
                var forwardImages = data['images']['forward'];
                var forwardAssets = [];
                try {
                    parent._removeImageSet(forwardTranslated);
                } catch (e) {}
                for (var i=0; i<forwardImages.length; i++) {
                    forwardAssets.push(parent.addImage(name+"/"+forwardImages[i], forwardTranslated, false));
                }
                parent.qObject.setForwardAssets(forwardAssets);
                var backwardTranslated = TEnvironment.getMessage("backward");
                var backwardImages = data['images']['backward'];
                var backwardAssets = [];
                try {
                    parent._removeImageSet(backwardTranslated);
                } catch (e) {}
                for (var i=0; i<backwardImages.length; i++) {
                    backwardAssets.push(parent.addImage(name+"/"+backwardImages[i], backwardTranslated, false));
                }
                parent.qObject.setBackwardAssets(backwardAssets);
                parent._displayNextImage(frontTranslated);
                parent.qObject.setDurations(data['durationMove'], data['durationPause']);
            }
        }).fail(function(jqxhr, textStatus, error) {
            throw new Error(TUtils.format(parent.getMessage("unknwon character"), name));
        });

    };
    
    Hero.prototype._setScene = function(object) {
        
    };
    
    /*Walker.prototype._addBlock = function(block) {
        block = TUtils.getObject(block);
        this.qObject.addBlock(block);
        var self = this;
        if (!block.isReady(function () {
            self.blockReady();
        })) {
            // wait for block to be loaded
            this.qObject.waitForBlock();
        }
    };
    
    Walker.prototype._mayFall = function(value) {
        value = TUtils.getBoolean(value);
        this.qObject.mayFall(value);
    };

    Walker.prototype._setJumpSpeed = function(value) {
        value = TUtils.getInteger(value);
        this.qObject.setJumpSpeed(value);
    };

    Walker.prototype._jump = function() {
        this.qObject.jump();
    };

    Walker.prototype.blockReady = function() {
        this.qObject.blockReady();
    };

    Walker.prototype._setGravity = function(value) {
        value = TUtils.getInteger(value);
        this.qObject.setGravity(value);
    };*/

    TEnvironment.internationalize(Hero, true);
    
    return Hero;
});