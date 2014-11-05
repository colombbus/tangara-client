define(['jquery','TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, Block, TUtils) {
    var Item = function(name) {
        Sprite.call(this, name);
    };
    
    Item.prototype = Object.create(Sprite.prototype);
    
    var qInstance = Item.prototype.qInstance;
    
    Item.prototype.qSprite = qInstance.TSprite;
    
    TEnvironment.internationalize(Item, true);
    
    return Item;
});


