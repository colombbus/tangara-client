define(['jquery', 'TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, Block, TUtils) {
    /**
     * Defines Item, inherited from Sprite.
     * Item is a Sprite which can be picked up.
     * @param {String} name Item's name
     * @exports Item
     */
     var Item = function(name) {
        Sprite.call(this, name);
        this.addImage("ball.gif", "", false);
        this.setDisplayedImage("ball.gif");
    };

    Item.prototype = Object.create(Sprite.prototype);
    Item.prototype.constructor = Item;
    Item.prototype.className = "Item";

    var graphics = Item.prototype.graphics;

    Item.prototype.gClass = graphics.addClass("TSprite", "TItem", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                type: TGraphicalObject.TYPE_ITEM | TGraphicalObject.TYPE_SPRITE
            }, props), defaultProps);
        }
    });

    return Item;
});


