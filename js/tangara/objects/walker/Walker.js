define(['jquery','TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'utils/TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, TUtils) {
    var Walker = function(name) {
        Sprite.call(this,name);
    };
    
    Walker.prototype = Object.create(Sprite.prototype);
    Walker.prototype.constructor = Walker;
    Walker.prototype.className = "Walker";
    
    var qInstance = Walker.prototype.qInstance;
    
    qInstance.TSprite.extend("TWalker", {
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
    });
    
    Walker.prototype.qSprite = qInstance.TWalker;

    Walker.prototype._addBlock = function(block) {
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
    };

    TEnvironment.internationalize(Walker, true);
    
    return Walker;
});