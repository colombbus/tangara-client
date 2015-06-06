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
                ctx.drawImage(qInstance.asset(p.assetBlock),-p.cx,-p.cy);            
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
            this.p.asset = false;
            this.p.assetBlock = false;            
        }
    });
    
    Scene.prototype.qSprite = qInstance.TScene;
    
    
    Scene.prototype.setDisplayedImage = function(name) {
        var asset = this.images[name];
        var qObject = this.qObject;
        // check if image actually loaded
        if (qInstance.assets[asset]) {
            if (name === this.backgroundName) {
                qObject.setBackground(asset);
            } 
            if (name === this.blockName) {
                // block loaded. Compute Transparency Mask
                this.computeTransparencyMask(asset);
                qObject.setBlock(asset);
            }
        } else {
            // otherwise, image will be displayed once loaded
            if (typeof Sprite.waitingForImage[name] === 'undefined') {
                Sprite.waitingForImage[name] = new Array();
            }
            if (Sprite.waitingForImage[name].indexOf(this) === -1) {
                Sprite.waitingForImage[name].push(this);
            }
        }
    };
   
    
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
                var currentLocation = false;
                if (parent.qObject.p.initialized) {
                    currentLocation = parent.qObject.getLocation();
                }
                var backImage = data['images']['background'];
                var blockImage = data['images']['block'];
                try {
                    parent._removeImageSet("elements");
                } catch (e) {}
                parent.backgroundName = name+"/"+backImage;
                parent.blockName = name+"/"+blockImage;
                parent.addImage(parent.backgroundName, "elements", false);
                parent.addImage(parent.blockName, "elements", false);
                // set initialized to false, to be sure that location will be set after next image is displayed
                // (and width and height are correctly set)
                parent.qObject.reinit();
                if (currentLocation !== false) {
                    parent.qObject.setLocation(currentLocation.x, currentLocation.y);
                }
                parent.setDisplayedImage(parent.blockName);
                parent.setDisplayedImage(parent.backgroundName);
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
        var currentLocation = false;
        if (this.qObject.p.initialized) {
            currentLocation = this.qObject.getLocation();
        }
        try {
            this.removeImage(this.backgroundName);
        } catch (e) {}
        this.backgroundName = name;
        this.addImage(this.backgroundName, "elements", true);
        this.qObject.p.initialized = false;
        if (currentLocation !== false) {
            this.qObject.setLocation(currentLocation.x, currentLocation.y);
        }
        this.setDisplayedImage(this.backgroundName);
    };

    Scene.prototype._setBlock = function(name) {
        name = TUtils.getString(name);
        try {
            this.removeImage(this.blockName);
        } catch (e) {}
        this.blockName = name;
        this.qObject.p.initialized = false;
        this.addImage(this.blockName, "elements", true);
        this.setDisplayedImage(this.blockName);
    };
    
    Scene.prototype.setTransparent = function(red, green, blue) { 
        var callbacks = {};
        if (typeof this.images[this.blockName] !== 'undefined') {
            var parent = this;
            this.qObject.p.initialized = false;
            callbacks[this.blockName] = function() {
                // reset block image in order to compute transparency mask
                parent.setDisplayedImage(parent.blockName);
            };
        }
        Sprite.prototype._setTransparent.call(this, red, green, blue, callbacks);
    };
    
    TEnvironment.internationalize(Scene, true);
    
    return Scene;
});


