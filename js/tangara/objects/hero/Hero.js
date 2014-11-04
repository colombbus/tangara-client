define(['jquery','TEnvironment', 'TGraphicalObject', 'objects/sprite/Walker', 'TUtils'], function($, TEnvironment, TGraphicalObject, Walker, TUtils) {
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
    
    /*var qInstance = Hero.prototype.qInstance;
    
    qInstance.TWalker.extend("THero", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                type:TGraphicalObject.TYPE_WALKER | TGraphicalObject.TYPE_SPRITE,
                mayFall:false,
                jumping:false,
                vy:0,
                gravity:9.8*100,
                jumpDelay:10,
                jumpAvailable:0,
                jumpSpeed: -300,
                waitingForBlocks:0
            },props),defaultProps);
            this.blocks = new Array();
        },
        step: function(dt) {
            if (!this.p.dragging && !this.p.frozen && this.p.waitingForBlocks === 0) {
                if (this.p.mayFall && (this.p.direction === Sprite.DIRECTION_UP || this.p.direction === Sprite.DIRECTION_DOWN)) {
                    // cannot move upward or downward when walker may fall
                    this.p.direction = Sprite.DIRECTION_NONE;
                }
                this._super(dt);
                if (this.p.mayFall) {
                    if (this.p.jumpAvailable>0)
                        this.p.jumpAvailable--;
                    if (this.p.jumping) {
                        if (this.p.jumpAvailable>0) {
                            // perform a jump
                            this.p.vy = this.p.jumpSpeed;
                        }
                        this.p.jumping = false;
                    } else {
                        this.p.vy += this.p.gravity * dt;
                    }
                    this.p.y += this.p.vy * dt;
                    // no destinationY other than y can be set
                    this.p.destinationY = this.p.y;
                }
                // Look for blocks
                var skip = 0;
                var collided = this.stage.TsearchSkip(this, TGraphicalObject.TYPE_BLOCK, skip);
                // Max 2 overlapping blocks are searched
                while(collided !== false && skip<2) {
                    this.checkBlocks(collided);
                    skip++;
                    collided = this.stage.TsearchSkip(this, TGraphicalObject.TYPE_BLOCK, skip);
                }
            }
        },
        checkBlocks: function(col) {
            var object = col.obj;
            var id = object.getId();
            if (object.p.type === TGraphicalObject.TYPE_BLOCK && this.blocks.indexOf(id)>-1 && !object.checkTransparency(this,col)) {
                // block encountered
                this.p.x -= col.separate[0];
                this.p.y -= col.separate[1];
                if(this.p.mayFall) {
                    this.p.destinationY = this.p.y;
                    if (col.normalY < -0.3 && this.p.vy>0 ) {
                        // landed
                        this.p.vy = 0;
                        this.p.jumpAvailable = this.p.jumpDelay;
                    } else if (col.normalY > 0.3 && this.p.vy<0) {
                        // bumped top
                        this.p.vy = 0;
                    }
                }
            }
        },
        addBlock: function(block) {
            var objId = block.getQObject().getId();
            if (this.blocks.indexOf(objId) === -1) {
                this.blocks.push(objId);
            }
        },
        mayFall: function(value) {
            this.perform(function(){
                this.p.mayFall = value;
            });
        },
        setJumpSpeed: function(value) {
            this.perform(function(){
                this.p.jumpSpeed = -3*value;
            });
        },
        setGravity: function(value) {
            this.perform(function(){
                this.p.gravity = 9.8*value;
            });
        },
        jump: function() {
            this.perform(function(){
                this.p.jumping = true;
            });
        },
        waitForBlock: function() {
            this.p.waitingForBlocks++;
        },
        blockReady: function() {
            this.p.waitingForBlocks--;
        }
    });*/
    
    Hero.prototype.qSprite = qInstance.THero;
    
    
    Hero.prototype._setCharacter = function(name) {
        name = TUtils.getString(name);
        var baseCharacterUrl = this.getResource(name)+"/";
        var configUrl = baseCharacterUrl+"config.json";
        var parent = this;
        $.ajax({
            dataType: "json",
            url: configUrl,
            async: true,
            success: function(data) {
                var forwardTranslated = TEnvironment.getMessage("forward");
                var forwardImages = data['images']['forward'];
                try {
                    parent._removeImageSet(forwardTranslated);
                } catch (e) {}
                for (var i=0; i<forwardImages.length; i++) {
                    parent._addImage(forwardImages[i], forwardTranslated);
                }
                var backwardTranslated = TEnvironment.getMessage("backward");
                var backwardImages = data['images']['backward'];
                try {
                    parent._removeImageSet(backwardTranslated);
                } catch (e) {}
                for (var i=0; i<backwardImages.length; i++) {
                    parent._addImage(backwardImages[i], backwardTranslated);
                }
                var frontTranslated = TEnvironment.getMessage("front");
                var frontImages = data['images']['front'];
                try {
                    parent._removeImageSet(frontTranslated);
                } catch (e) {}
                for (var i=0; i<frontImages.length; i++) {
                    parent._addImage(frontImages[i], frontTranslated);
                }
                parent._displayNextImage(frontTranslated);
                
            }
        }).fail(function(jqxhr, textStatus, error) {
            throw new Error(TUtils.format(parent.getMessage("unknwon skeleton"), name));
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