define(['jquery','TEnvironment', 'TGraphicalObject', 'objects/block/Block', 'TUtils'], function($, TEnvironment, TGraphicalObject, Block, TUtils) {
    var Scene = function(name) {
        Block.call(this);
        if (typeof(name)==='undefined') {
            name = "nature";
        }
        this.backgroundAsset="";
        this.blockName="";
        this.displayBlock=true;
        this._setScene(name);
    };
    
    Scene.prototype = Object.create(Block.prototype);
    Scene.prototype.constructor = Scene;
    Scene.prototype.className = "Scene";
    
    var qInstance = Scene.prototype.qInstance;
    
    Scene.prototype.qSprite = qInstance.TBlock;
    
    Scene.prototype.setDisplayedImage = function(name) {
        if (Block.prototype.setDisplayedImage.call(this, name)) {
            if (!this.displayBlock) {
                // display background
                this.qObject.asset(this.backgroundAsset, true);
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
                parent.backgroundAsset = parent.addImage(name+"/"+backImage, "elements", false);
                parent.blockName = name+"/"+blockImage;
                parent.addImage(parent.blockName, "elements", false);
                // set initialized to false, to be sure that location will be set after next image is displayed
                // (and width and height are correctly set)
                parent.qObject.p.initialized = false;
                parent._displayImage(parent.blockName);
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
        this.setDisplayedImage(this.blockName);
    };

    TEnvironment.internationalize(Scene, true);
    
    return Scene;
});


