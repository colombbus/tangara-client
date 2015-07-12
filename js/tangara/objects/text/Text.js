define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'TGraphicalObject'], function($, TEnvironment, TUtils, CommandManager, TGraphicalObject) {
    var Text = function(label) {
        TGraphicalObject.call(this);
        if (TUtils.checkString(label)) {
            this._setText(label);
        }
        this.gObject.initialized();
    };

    Text.prototype = Object.create(TGraphicalObject.prototype);
    Text.prototype.constructor = Text;
    Text.prototype.className = "Text";

    var graphics = Text.prototype.graphics;

    Text.prototype.gClass = graphics.addClass("TGraphicalObject", "TText", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                textColor: "#000000",
                w: 0,
                h: 0,
                label: "",
                textSize: 12,
                type: TGraphicalObject.TYPE_INACTIVE
            }, props), defaultProps);
        },
        updateSize: function() {
            var oldH = this.p.h;
            var oldW = this.p.w;
            var context = graphics.getContext();
            context.font = "normal " + this.p.textSize + "px Verdana,Sans-serif";
            this.p.h = this.p.textSize;
            this.p.w = context.measureText(this.p.label).width;
            this.p.x += this.p.w / 2 - oldW / 2;
            this.p.y += this.p.h / 2 - oldH / 2;
            graphics.objectResized(this);
        },
        draw: function(context) {
            context.fillStyle = this.p.textColor;
            context.textBaseline = "middle";
            context.font = "normal " + this.p.textSize + "px Verdana,Sans-serif";
            context.fillText(this.p.label, -this.p.w / 2, 0);
        }
    });

    Text.prototype._setText = function(label) {
        label = TUtils.getString(label);
        var gObject = this.gObject;
        gObject.p.label = label;
        gObject.updateSize();
    };

    Text.prototype._setTextSize = function(size) {
        size = TUtils.getInteger(size);
        var gObject = this.gObject;
        gObject.p.textSize = size;
        gObject.updateSize();
    };

    Text.prototype._setColor = function(red, green, blue) {
        var color = TUtils.getColor(red, green, blue);
        var gObject = this.gObject;
        gObject.p.textColor = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";        
    };

    TEnvironment.internationalize(Text, true);

    return Text;
});



