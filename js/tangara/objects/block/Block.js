define(['jquery','TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite'], function($, TEnvironment, TGraphicalObject, Sprite) {
    var Block = function(name) {
        Sprite.call(this,name);
    };
    
    Block.prototype = Object.create(Sprite.prototype);
    Block.prototype.constructor = Block;
    Block.prototype.className = "Block";
    
    var qInstance = Block.prototype.qInstance;
    
    qInstance.TSprite.extend("TBlock", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                type:TGraphicalObject.TYPE_BLOCK,
                collisionMask:TGraphicalObject.TYPE_SPRITE
            },props),defaultProps);
        }
    });
    
    Block.prototype.qSprite = qInstance.TBlock;


    TEnvironment.internationalize(Block, true);
    
    return Block;
});


