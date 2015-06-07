define(['jquery','TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'objects/block/Block', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, Block, TUtils) {
    var Scene = function(name) {
        Block.call(this);
        if (typeof(name)==='undefined') {
            name = "nature";
        }
        this.backgroundName="";
        this.blockName="";
        this._setScene(name);
    };
    
    Scene.prototype = Object.create(Block.prototype);
    Scene.prototype.constructor = Scene;
    Scene.prototype.className = "Scene";
    
    var qInstance = Scene.prototype.qInstance;
    
    qInstance.TBlock.extend("TScene", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                assetBlock:null,
                showBlock:false
            },props),defaultProps);
        },
        draw: function(ctx) {
            this._super(ctx);
            var p = this.p;
            if (p.showBlock && p.assetBlock) {
                ctx.drawImage(this.resources.getUnchecked(p.assetBlock),-p.cx,-p.cy);            
            }
        },
        setBackground: function(asset) {
            this.p.asset = asset;
            // resize only for background
            this.size(true);
            qInstance._generatePoints(this,true);
            if (!this.p.initialized && this.p.assetBlock) {
                this.initialized();
            }
        },
        setBlock: function(asset) {
            this.p.assetBlock = asset;
            if (!this.p.initialized && this.p.asset) {
                this.initialized();
            }
        },
        setBlockDisplayed: function(value) {
            this.p.showBlock = value;
        },
        reinit: function() {
            this.p.initialized = false;
            this.p.asset = null;
            this.p.assetBlock = null;            
        },
        removeBlock: function() {
            this.p.initialized = false;
            this.p.assetBlock = null;            
        },
        removeBackground: function() {
            this.p.initialized = false;
            this.p.asset = null;            
        }
    });
    
    Scene.prototype.qSprite = qInstance.TScene;
    
    /*Scene.prototype.setDisplayedImage = function(name) {
        this.displayedImage = name;
        var image = this.resources.get(name);
        if (image === false) {
            // asset not ready
            this.waitingForImage = name;
            return false;
        } else {
            var qObject = this.qObject;
            if (name === this.backgroundName) {
                qObject.setBackground(name);
            } 
            return true;
        }
    };   */
    
    Scene.prototype._setScene = function(name) {
        name = TUtils.getString(name);
        name = this.getMessage(name);
        var baseSceneUrl = this.getResource(name)+"/";
        var configUrl = baseSceneUrl+"config.json";
        var parent = this;
        $.ajax({
            dataType: "json",
            url: configUrl,
            async: false,
            success: function(data) {
                var backImage = data['images']['background'];
                var blockImage = data['images']['block'];
                try {
                    parent._removeImageSet("elements");
                } catch (e) {}
                parent.qObject.reinit();
                var backgroundName = name+"/"+backImage;
                parent.backgroundName = backgroundName;
                var blockName = name+"/"+blockImage;
                parent.blockName = blockName;
                parent.addImage(backgroundName, "elements", false, function() {
                    // background may have change during loading
                    if (parent.backgroundName === backgroundName) {
                        var currentLocation = parent.qObject.getLocation();
                        parent.qObject.setBackground(backgroundName);
                        parent.qObject.setLocation(currentLocation.x, currentLocation.y);
                    }
                });
                parent.addImage(blockName, "elements", false, function() {
                    // block may have change during loading
                    if (parent.blockName === blockName) {
                        parent.computeTransparencyMask(blockName);
                        parent.qObject.setBlock(blockName);
                    }
                });
            }
        }).fail(function(jqxhr, textStatus, error) {
            throw new Error(TUtils.format(parent.getMessage("unknwon character"), name));
        });
    };        
    
    Scene.prototype._showBlock = function() {
        this.qObject.setBlockDisplayed(true);
    };

    Scene.prototype._hideBlock = function() {
        this.qObject.setBlockDisplayed(false);
    };

    Scene.prototype._setBackground = function(name) {
        name = TUtils.getString(name);
        try {
            this.removeImage(this.backgroundName);
        } catch (e) {}
        this.backgroundName = name;
        var sceneObject = this;
        var qObject = this.qObject;
        qObject.removeBackground();
        this.addImage(name, "elements", true, function() {
            if (name === sceneObject.backgroundName) {
                var currentLocation = qObject.getLocation();
                qObject.setBackground(name);
                qObject.setLocation(currentLocation.x, currentLocation.y);
            }
        });
    };

    Scene.prototype._setBlock = function(name) {
        name = TUtils.getString(name);
        try {
            this.removeImage(this.blockName);
        } catch (e) {}
        this.blockName = name;
        var sceneObject = this;
        var qObject = this.qObject;
        qObject.removeBlock();
        this.addImage(name, "elements", true, function() {            
            if (name === sceneObject.blockName) {
                sceneObject.computeTransparencyMask(name);
                qObject.setBlock(name);
            }
        });
    };
    
    Scene.prototype._setTransparent = function(red, green, blue) { 
        var callbacks = {};
        if (this.resources.has(this.blockName)) {
            var parent = this;
            this.qObject.removeBlock();
            callbacks[this.blockName] = function() {
                parent.computeTransparencyMask(parent.blockName);
                parent.qObject.setBlock(parent.blockName);
            };
        }
        if (this.resources.has(this.backgroundName)) {
            var parent = this;
            this.qObject.removeBackground();
            callbacks[this.backgroundName] = function() {
                parent.qObject.setBackground(parent.backgroundName);
            };
        }
        Sprite.prototype.setTransparent.call(this, red, green, blue, callbacks);
    };
    
    TEnvironment.internationalize(Scene, true);
    
    return Scene;
});


