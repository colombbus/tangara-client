define(['jquery','TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, Block, TUtils) {
    var Item = function(name) {
        Sprite.call(this, name);
        var qObject = this.qObject;
        var resource = this.getResource("ball.gif");
        qInstance.load(resource, function() {
            qObject.asset(resource, true);
            qObject.initialized();
        });

    };
    
    Item.prototype = Object.create(Sprite.prototype);
    Item.prototype.constructor = Item;
    Item.prototype.className = "Item";

    var qInstance = Item.prototype.qInstance;
    
    qInstance.TSprite.extend("TItem", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                type:TGraphicalObject.TYPE_ITEM | TGraphicalObject.TYPE_SPRITE
            },props),defaultProps); }
    });
    
    Item.prototype.qSprite = qInstance.TItem;
    
    TEnvironment.internationalize(Item, true);
    
    return Item;
});


