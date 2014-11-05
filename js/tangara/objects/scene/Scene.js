define(['jquery','TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'objects/block/Block', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, Block, TUtils) {
    var Scene = function(name) {
        Block.call(this);
        if (typeof(name)==='undefined') {
            name = "nature";
        }
        this.backgroundName="";
        this.blockName="";
        this.displayBlock=false;
        this._setScene(name);
    };
    
    Scene.prototype = Object.create(Block.prototype);
    Scene.prototype.constructor = Scene;
    Scene.prototype.className = "Scene";
    
    var qInstance = Scene.prototype.qInstance;
    
    qInstance.TBlock.extend("TScene", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                computing:false
            },props),defaultProps);
        },
        draw: function(ctx) {
            var p = this.p;
            if (!p.computing) {
                this._super(ctx);
            }
        },
        setComputing: function() {
            this.p.computing = true;
        },
        unsetComputing: function() {
            this.p.computing = false;
        }

    });
    
    Scene.prototype.qSprite = qInstance.TScene;
    
    
    Scene.prototype.setDisplayedImage = function(name) {
        if (Sprite.prototype.setDisplayedImage.call(this, name)) {
            // compute transparency mask
            if (name === this.blockName) {
                var asset = this.images[name];
                this.computeTransparencyMask(asset);
                if (!this.displayBlock) {
                    // display background
                    this.setDisplayedImage(this.backgroundName);
                } else {
                    this.qObject.unsetComputing();
                }
            } else {
                this.qObject.unsetComputing();                    
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
                parent.qObject.p.initialized = false;
                parent.qObject.setComputing();
                parent.setDisplayedImage(parent.blockName);
                if (currentLocation !== false) {
                    parent.qObject.setLocation(currentLocation.x, currentLocation.y);
                }
            }
        }).fail(function(jqxhr, textStatus, error) {
            throw new Error(TUtils.format(parent.getMessage("unknwon character"), name));
        });
    };        
    
    Scene.prototype._showBlock = function() {
        this.displayBlock = true;
        this.setDisplayedImage(this.blockName);
    };

    Scene.prototype._hideBlock = function() {
        this.displayBlock = false;
        this.setDisplayedImage(this.backgroundName);
    };

    Scene.prototype._setBackground = function(name) {
        name = TUtils.getString(name);
        try {
            this.removeImage(this.backgroundName);
        } catch (e) {}
        this.backgroundName = name;
        this.addImage(this.backgroundName, "elements", true);
        if (!this.displayBlock) {
            this.setDisplayedImage(this.backgroundName);
        }
    };

    Scene.prototype._setBlock = function(name) {
        name = TUtils.getString(name);
        try {
            this.removeImage(this.blockName);
        } catch (e) {}
        this.blockName = name;
        this.addImage(this.blockName, "elements", true);
        // anyway, because we have to re-compute mask
        this.qObject.setComputing();
        this.setDisplayedImage(this.blockName);
    };    
    
    TEnvironment.internationalize(Scene, true);
    
    return Scene;
});


