define(['jquery','TEnvironment', 'TGraphicalObject', 'TUtils', 'objects/sprite/Sprite'], function($, TEnvironment, TGraphicalObject, TUtils, Sprite) {
    var Block = function(name) {
        Sprite.call(this,name);
        this.transparentColor = null;
        this.mask = null;
    };
    
    Block.prototype = Object.create(Sprite.prototype);
    Block.prototype.constructor = Block;
    Block.prototype.className = "Block";
    
    var qInstance = Block.prototype.qInstance;
    
    qInstance.TSprite.extend("TBlock", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                type:TGraphicalObject.TYPE_BLOCK,
                collisionMask:TGraphicalObject.TYPE_SPRITE,
                imageData:null
            },props),defaultProps);
        },
        setImageData: function(data) {
            this.perform(function(value){
                this.p.imageData = value;
            }, [data]);
        }
    });
    
    Block.prototype.qSprite = qInstance.TBlock;

    
    Block.prototype._setTransparent = function(red, green, blue) {
        if (TUtils.checkInteger(red) && TUtils.checkInteger(green) && TUtils.checkInteger(blue)) {
            if (typeof this.images[this.displayedImage] !=='undefined') {
                var asset = this.images[this.displayedImage];
                var image = qInstance.asset(asset);
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0 );
                var imageData = ctx.getImageData(0, 0, image.width, image.height);
                var data = imageData.data;
                //console.debug(myData);
                for (var i=0;i<data.length;i+=4) {
                    var r=data[i];
                    var g=data[i+1];
                    var b=data[i+2];
                    if (r===red && g===green && b===blue) {
                        data[i+3] = 0;
                    }
                }
                imageData.data = data;
                ctx.putImageData(imageData,0,0);
                
                image.src = canvas.toDataURL();
            }
        }
    };

    TEnvironment.internationalize(Block, true);
    
    return Block;
});


