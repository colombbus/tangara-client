define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'TGraphicalObject'], function($, TEnvironment, TUtils, CommandManager, TGraphicalObject) {
    var Text = function(label) {
        TGraphicalObject.call(this);
        if (TUtils.checkString(label)) {
            this._setText(label);
        }
        this.qObject.initialized();
    };

    Text.prototype = Object.create(TGraphicalObject.prototype);
    Text.prototype.constructor = Text;
    Text.prototype.className = "Text";

    var qInstance = Text.prototype.qInstance;

    qInstance.TGraphicalObject.extend("TText", {
        init: function(props, defaultProps) {
            this._super(qInstance._extend({
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
            var context = qInstance.ctx;
            context.font = "normal " + this.p.textSize + "px Verdana,Sans-serif";
            this.p.h = this.p.textSize;
            this.p.w = context.measureText(this.p.label).width;
            this.p.x += this.p.w / 2 - oldW / 2;
            this.p.y += this.p.h / 2 - oldH / 2;
            qInstance._generatePoints(this, true);
        },
        draw: function(context) {
            context.fillStyle = this.p.textColor;
            context.textBaseline = "middle";
            context.fillText(this.p.label, -this.p.w / 2, 0);
        }
    });

    Text.prototype.qSprite = qInstance.TText;

    Text.prototype._setText = function(label) {
        if (TUtils.checkString(label)) {
            var qObject = this.qObject;
            qObject.p.label = label;
            qObject.updateSize();
        }
    };

    Text.prototype._setTextSize = function(size) {
        if (TUtils.checkInteger(size)) {
            var qObject = this.qObject;
            qObject.p.textSize = size;
            qObject.updateSize();
        }
    };

    Text.prototype._setColor = function(red, green, blue) {
        var r, g, b;
        if (TUtils.checkString(red)) {
            var value = TUtils.getColor(red);
            if (value !== null) {
                red = value[0];
                green = value[1];
                blue = value[2];
            } else {
                throw new Error(this.getMessage("wrong color"));
            }
        }
        if (TUtils.checkInteger(red) && TUtils.checkInteger(green) && TUtils.checkInteger(blue)) {
            r = Math.min(Math.abs(red), 255);
            g = Math.min(Math.abs(green), 255);
            b = Math.min(Math.abs(blue), 255);
            var qObject = this.qObject;
            qObject.p.textColor = "rgb(" + r + "," + g + "," + b + ")";
        } else {
            throw new Error(this.getMessage("wrong color"));
        }
    };

    TEnvironment.internationalize(Text, true);

    return Text;
});



