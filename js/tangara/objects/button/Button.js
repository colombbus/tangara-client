define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'TGraphicalObject'], function($, TEnvironment, TUtils, CommandManager, TGraphicalObject) {
    var Button = function(label) {
        window.console.log("Initializing button");
        TGraphicalObject.call(this);
        if (TUtils.checkString(label)) {
            this._setText(label);
        }
        this._setLocation(0, 0);
        this.qObject.initialized();
    };

    Button.prototype = new TGraphicalObject();
    Button.prototype.constructor = Button;
    Button.prototype.className = "Button";

    var qInstance = TEnvironment.getQuintusInstance();

    qInstance.TGraphicalObject.extend("TButton", {
        init: function(props, defaultProps) {
            this._super(qInstance._extend({
                fillColor: "#4d8cc2",
                strokeColor: "#0d4c82",
                textColor: "#ffffff",
                fillColorActive: "#3276b1",
                strokeColorActive: "#0d4c82",
                textColorActive: "#ffffff",
                w: 50,
                h: 24,
                active: false,
                label: "",
                textSize: 12,
                radius: 7,
                executed: false,
                type: TGraphicalObject.TYPE_INPUT
            }, props), defaultProps);
            this.on("touch");
            this.on("touchEnd");
            this.commands = new CommandManager();
        },
        updateSize: function() {
            var oldH = this.p.h;
            var oldW = this.p.w;
            var context = qInstance.ctx;
            context.font = "normal " + this.p.textSize + "px Verdana,Sans-serif";
            this.p.h = 2 * this.p.textSize;
            this.p.w = context.measureText(this.p.label).width + 2 * this.p.textSize;
            this.p.x += this.p.w / 2 - oldW / 2;
            this.p.y += this.p.h / 2 - oldH / 2;
            qInstance._generatePoints(this, true);
        },
        draw: function(context) {
            // draw path
            context.beginPath();
            context.moveTo(-this.p.w / 2, 0);
            context.lineTo(-this.p.w / 2, -this.p.h / 2 + this.p.radius);
            context.arcTo(-this.p.w / 2, -this.p.h / 2, -this.p.w / 2 + this.p.radius, -this.p.h / 2, this.p.radius);
            context.lineTo(this.p.w / 2 - this.p.radius, -this.p.h / 2);
            context.arcTo(this.p.w / 2, -this.p.h / 2, this.p.w / 2, -this.p.h / 2 + this.p.radius, this.p.radius);
            context.lineTo(this.p.w / 2, this.p.h / 2 - this.p.radius);
            context.arcTo(this.p.w / 2, this.p.h / 2, this.p.w / 2 - this.p.radius, this.p.h / 2, this.p.radius);
            context.lineTo(-this.p.w / 2 + this.p.radius, this.p.h / 2);
            context.arcTo(-this.p.w / 2, this.p.h / 2, -this.p.w / 2, this.p.h / 2 - this.p.radius, this.p.radius);
            context.lineTo(-this.p.w / 2, 0);
            context.closePath();

            // fill button
            if (this.p.active)
                context.fillStyle = this.p.fillColorActive;
            else
                context.fillStyle = this.p.fillColor;
            context.fill();

            // stroke button
            context.lineWidth = 1;
            if (this.p.active)
                context.strokeStyle = this.p.strokeColorActive;
            else
                context.strokeStyle = this.p.strokeColor;
            context.stroke();

            // draw text
            if (this.p.active)
                context.fillStyle = this.p.textColorActive;
            else
                context.fillStyle = this.p.textColor;
            context.textBaseline = "middle";
            context.fillText(this.p.label, -this.p.w / 2 + this.p.textSize, 0);

        },
        touch: function(touch) {
            if (!this.p.designMode) {
                this.p.active = true;
                if (!this.p.executed) {
                    this.executeCommands();
                    this.p.executed = true;
                }
            }
        },
        touchEnd: function(touch) {
            if (!this.p.designMode) {
                this.p.active = false;
                this.p.executed = false;
            }
        },
        addCommand: function(command) {
            this.commands.addCommand(command);
        },
        executeCommands: function() {
            this.commands.executeCommands();
        },
        removeCommands: function() {
            this.commands.removeCommands();
        }
    });

    Button.prototype.qSprite = qInstance.TButton;

    Button.prototype._setText = function(label) {
        if (TUtils.checkString(label)) {
            var qObject = this.qObject;
            qObject.p.label = label;
            qObject.updateSize();
        }
    };

    Button.prototype._setTextSize = function(size) {
        if (TUtils.checkInteger(size)) {
            var qObject = this.qObject;
            qObject.p.textSize = size;
            qObject.updateSize();
        }
    };

    Button.prototype._setColor = function(red, green, blue) {
        var r, g, b, ra, ga, ba;
        if (TUtils.checkInteger(red) && TUtils.checkInteger(green) && TUtils.checkInteger(blue)) {
            r = Math.min(Math.abs(red), 255);
            g = Math.min(Math.abs(green), 255);
            b = Math.min(Math.abs(blue), 255);
            ra = Math.max(r - 40, 0);
            ga = Math.max(g - 40, 0);
            ba = Math.max(b - 40, 0);
            var qObject = this.qObject;
            qObject.p.fillColor = "rgb(" + r + "," + g + "," + b + ")";
            qObject.p.fillColorActive = "rgb(" + ra + "," + ga + "," + ba + ")";
            qObject.p.strokeColor = "rgb(" + ra + "," + ga + "," + ba + ")";
            qObject.p.strokeColorActive = "rgb(" + ra + "," + ga + "," + ba + ")";
        }
    };

    Button.prototype._setTextColor = function(red, green, blue) {
        var r, g, b;
        if (TUtils.checkInteger(red) && TUtils.checkInteger(green) && TUtils.checkInteger(blue)) {
            r = Math.min(Math.abs(red), 255);
            g = Math.min(Math.abs(green), 255);
            b = Math.min(Math.abs(blue), 255);
            var qObject = this.qObject;
            qObject.p.textColor = "rgb(" + r + "," + g + "," + b + ")";
        }
    };

    Button.prototype._addCommand = function(command) {
        if (TUtils.checkCommand(command)) {
            this.qObject.addCommand(command);
        }
    };

    Button.prototype._removeCommands = function() {
        this.qObject.removeCommands();
    };

    TEnvironment.internationalize(Button, true);

    return Button;
});



