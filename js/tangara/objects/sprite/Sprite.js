define(['jquery','TEnvironment', 'TUtils', 'TGraphicalObject'], function($, TEnvironment, TUtils, TGraphicalObject) {
    var Sprite = function(name) {
        window.console.log("Initializing sprite");
        TGraphicalObject.call(this);
        this.images = new Array();
        this.displayedImage = "";
        if (typeof name === 'string') {
          this._setImage(name);
        }
    };
    
    Sprite.prototype = new TGraphicalObject();
    Sprite.prototype.constructor = Sprite;
    Sprite.prototype.className = "Sprite";
    
    var qInstance = TEnvironment.getQuintusInstance();
    
    qInstance.TGraphicalObject.extend("TSprite", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                destinationX: 0,
                destinationY: 0,
                velocity:200,
                type:TGraphicalObject.TYPE_SPRITE
            },props),defaultProps);
        },
        step: function(dt) {
            var p = this.p;
            if (!p.dragging) {
              var step = p.velocity*dt; 
              if (p.x < p.destinationX) {
                  p.x = Math.min(p.x+step, p.destinationX); 
              } else if (p.x > p.destinationX) {
                  p.x = Math.max(p.x-step, p.destinationX); 
              }
              if (p.y < p.destinationY) {
                  p.y = Math.min(p.y+step, p.destinationY); 
              } else if (p.y > p.destinationY) {
                  p.y = Math.max(p.y-step, p.destinationY); 
              }
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
            }, {});
        },
        setCenterLocation: function(x,y) {
            this._super(x,y);
            this.perform(function(){
                this.p.destinationX = this.p.x;this.p.destinationY = this.p.y;
            }, {});
        }
      });
    
    Sprite.prototype.qSprite = qInstance.TSprite;
    
    Sprite.prototype._moveForward = function(value) {
        if (TUtils.checkInteger(value)) {
          this.qObject.p.destinationX+=value;
        }
        return;
    };

    Sprite.prototype._moveBackward = function(value) {
        if (TUtils.checkInteger(value)) {
          this.qObject.p.destinationX-=value;
        }
        return;
    };
        
    Sprite.prototype._moveUpward = function(value) {
        if (TUtils.checkInteger(value)) {
          this.qObject.p.destinationY-=value;
        }
        return;
    };

    Sprite.prototype._moveDownward = function(value) {
        if (TUtils.checkInteger(value)) {
          this.qObject.p.destinationY+=value;
        }
        return;
    };
    
    Sprite.prototype._stop = function() {
        this.qObject.p.destinationX = this.qObject.p.x;
        this.qObject.p.destinationY = this.qObject.p.y;
        return;
    };
    
    Sprite.prototype._addImage = function(name) {
        if (TUtils.checkString(name)) {
            // add image only if not already added
            if (typeof this.images[name] === 'undefined') {
                var asset = TEnvironment.getUserResource(name);
                var qObject = this.qObject;
                var sprite = this;
                sprite.images[name] = asset;
                window.console.log("loading asset '"+asset+"'");
                qInstance.load(asset, function() {
                    // in case _displayImage is called while loading, set image
                    if (typeof sprite.images[sprite.displayedImage] !=='undefined' && qObject.p.asset !== sprite.images[sprite.displayedImage]) {
                        qObject.asset(sprite.images[sprite.displayedImage], true);
                        if (!qObject.p.initialized) {
                            qObject.initialized();
                        }
                    }
                });
            }
        } else {
            throw new Error(this.getMessage("format error"));
        }
    };

    Sprite.prototype._displayImage = function(name) {
        if (TUtils.checkString(name) && typeof this.images[name] !== 'undefined' && this.displayedImage !== name) {
            window.console.log("displaying image '"+name+"'");
            var asset = this.images[name];
            var qObject = this.qObject;
            this.displayedImage = name;
            // check if image actually loaded
            if (qInstance.assets[asset]) {
                window.console.log("setting asset '"+asset+"'");
                qObject.asset(asset, true);
                if (!qObject.p.initialized) {
                    qObject.initialized();
                }
            }
            // otherwise, image will be displayed once loaded
        } else {
            throw new Error(TUtils.format(this.getMessage("resource not found"), name));
        }
    };

    Sprite.prototype._setImage = function(name) {
        this._addImage(name);
        this._displayImage(name);
    };
    
    TEnvironment.internationalize(Sprite, true);
    
    return Sprite;
});



