define(['TObject', 'TUtils', 'TRuntime', 'TEnvironment'], function(TObject, TUtils, TRuntime, TEnvironment) {
    function TGraphicalObject() {
        this.gObject = new this.gClass();
        this._setLocation(0, 0);
        TRuntime.addGraphicalObject(this);
    }

    TGraphicalObject.prototype = Object.create(TObject.prototype);
    TGraphicalObject.prototype.constructor = TGraphicalObject;
    TGraphicalObject.prototype.className = "TGraphicalObject";
    TGraphicalObject.prototype.objectPath = "tgraphicalobject";
    

    TGraphicalObject.TYPE_CHARACTER = 0x0100;
    TGraphicalObject.TYPE_CATCHABLE = 0x0200;
    TGraphicalObject.TYPE_SPRITE = 0x0400;
    TGraphicalObject.TYPE_WALKER = 0x0800;
    TGraphicalObject.TYPE_BLOCK = 0x1000;
    TGraphicalObject.TYPE_INPUT = 0x2000;
    TGraphicalObject.TYPE_INACTIVE = 0x4000;
    TGraphicalObject.TYPE_ITEM = 0x8000;

    var graphics = TRuntime.getGraphics();

    TGraphicalObject.prototype.graphics = graphics;

    TGraphicalObject.prototype.gClass = graphics.addClass("TGraphicalObject", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                designMode: false,
                initialized: false,
                w: 0,
                h: 0
            }, props), defaultProps);
            this.operations = new Array();
        },
        designDrag: function(touch) {
            if (this.p.designMode) {
                this.p.dragging = true;
                this.p.x = touch.origX + touch.dx;
                this.p.y = touch.origY + touch.dy;
            }
        },
        designTouchEnd: function(touch) {
            if (this.p.designMode) {
                this.p.dragging = false;
                this.p.designCallback(this.p.x - this.p.w / 2, this.p.y - this.p.h / 2);
            }
        },
        perform: function(action, parameters) {
            if (this.p.initialized) {
                action.apply(this, parameters);
            } else {
                this.operations.push([action, parameters]);
            }
        },
        initialized: function() {
            this.p.initialized = true;
            while (this.operations.length > 0) {
                var operation = this.operations.shift();
                operation[0].apply(this, operation[1]);
            }
        },
        scale: function(scale) {
            this.perform(function(scale) {
                this.p.scale = scale * 1;
            }, [scale]);
        },
        zoomIn: function(scale) {
            this.perform(function(scale) {
                this.p.scale = scale + this.p.scale;
            }, [scale]);
        },
        zoomOut: function(scale) {
            this.perform(function(scale) {
                this.p.scale = -scale + this.p.scale;
            }, [scale]);
        },
        setAngle: function(angle) {
            this.perform(function(angle) {
                this.p.angle = angle;
            }, [angle]);
        },
        rotate: function(angle) {
            this.perform(function(angle) {
                this.p.angle = this.p.angle + angle;
            }, [angle]);
        },
        setLocation: function(x, y) {
            this.perform(function(x, y) {
                this.p.x = x + this.p.w / 2;
                this.p.y = y + this.p.h / 2;
            }, [x, y]);
        },
        getLocation: function() {
            return {x: Math.round(this.p.x - this.p.w / 2), y: Math.round(this.p.y - this.p.h / 2)};
        },
        getXCenter: function() {
            return Math.round(this.p.x);
        },
        getYCenter: function() {
            return Math.round(this.p.y);
        },
        getX: function() {
            return Math.round(this.p.x - this.p.w / 2);
        },
        getY: function() {
            return Math.round(this.p.y - this.p.h / 2);
        },
        setCenterLocation: function(x, y) {
            this.perform(function(x, y) {
                this.p.x = x;
                this.p.y = y;
            }, [x, y]);
        },
        freeze: function(value) {
            // to be implemented by subclasses
        }
    });

    TGraphicalObject.prototype.messages = null;

    TGraphicalObject.prototype.getGObject = function() {
        return this.gObject;
    };

    TGraphicalObject.prototype.deleteObject = function() {
        this.gObject.destroy();
        TRuntime.removeGraphicalObject(this);
    };

    TGraphicalObject.prototype._zoomIn = function(factor) {
        this.gObject.zoomIn(factor);
    };

    TGraphicalObject.prototype._zoomOut = function(factor) {
        this.gObject.zoomOut(factor);
    };

    TGraphicalObject.prototype._scale = function(factor) {
        //TODO: parseFloat
        this.gObject.scale(factor);
    };

    TGraphicalObject.prototype._setAngle = function(angle) {
        this.gObject.setAngle(angle);
    }

    TGraphicalObject.prototype._rotate = function(angle) {
        //TODO: parseFloat
        this.gObject.rotate(angle);
    };

    TGraphicalObject.prototype._setCenterLocation = function(x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.gObject.setCenterLocation(x, y);
    };

    TGraphicalObject.prototype._setLocation = function(x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.gObject.setLocation(x, y);
    };

    TGraphicalObject.prototype._getXCenter = function() {
        return this.gObject.getXCenter();
    };

    TGraphicalObject.prototype._getYCenter = function() {
        return this.gObject.getYCenter();
    };
    TGraphicalObject.prototype._getX = function() {
        return this.gObject.getX();
    };

    TGraphicalObject.prototype._getY = function() {
        return this.gObject.getY();
    };

    TGraphicalObject.prototype.setDesignMode = function(value) {
        var gObject = this.gObject;
        if (value) {
            gObject.on("drag", gObject, "designDrag");
            gObject.on("touchEnd", gObject, "designTouchEnd");
            for (var i = 0; i < gObject.children.length; i++) {
                gObject.children[i].on("drag", gObject, "designDrag");
                gObject.children[i].on("touchEnd", gObject, "designTouchEnd");
            }
            var self = this;
            gObject.p.designCallback = function(x, y) {
                require(["TUI"], function(TUI) {
                    TUI.recordObjectLocation(self, {x: Math.round(x), y: Math.round(y)});
                });
            };
            gObject.p.designMode = true;
        } else {
            gObject.off("drag", gObject, "designDrag");
            gObject.off("touchEnd", gObject, "designTouchEnd");
            for (var i = 0; i < gObject.children.length; i++) {
                gObject.children[i].off("drag", gObject, "designDrag");
                gObject.children[i].off("touchEnd", gObject, "designTouchEnd");
            }
            gObject.p.designCallback = null;
            gObject.p.designMode = false;
        }
    };

    TGraphicalObject.prototype.freeze = function(value) {
        this.gObject.freeze(value);
    };

    TGraphicalObject.prototype.toString = function() {
        return "TGraphicalObject " + this.className;
    };

    TGraphicalObject.prototype._hide = function() {
        this.gObject.p.hidden = true;
    };

    TGraphicalObject.prototype._show = function() {
        this.gObject.p.hidden = false;
    };

    return TGraphicalObject;
});