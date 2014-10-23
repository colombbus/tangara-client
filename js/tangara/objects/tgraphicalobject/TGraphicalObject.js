define(['TObject', 'TUtils', 'TRuntime', 'TEnvironment', ], function(TObject, TUtils, TRuntime, TEnvironment) {
    function TGraphicalObject() {
        this.qObject = new this.qSprite();
        this._setLocation(0, 0);
        TRuntime.addGraphicalObject(this);
    }

    TGraphicalObject.prototype = Object.create(TObject.prototype);
    TGraphicalObject.prototype.constructor = TGraphicalObject;

    TGraphicalObject.prototype.className = "TGraphicalObject";
    TGraphicalObject.TYPE_CHARACTER = 0x0100;
    TGraphicalObject.TYPE_CATCHABLE = 0x0200;
    TGraphicalObject.TYPE_SPRITE = 0x0400;
    TGraphicalObject.TYPE_WALKER = 0x0800;
    TGraphicalObject.TYPE_BLOCK = 0x1000;
    TGraphicalObject.TYPE_INPUT = 0x2000;
    TGraphicalObject.TYPE_INACTIVE = 0x4000;

    var qInstance = TRuntime.getQuintusInstance();

    qInstance.Sprite.extend("TGraphicalObject", {
        init: function(props, defaultProps) {
            this._super(qInstance._extend({
                designMode: false,
                initialized: false
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
                this.p.designCallback(this.p.x-this.p.w/2, this.p.y-this.p.h/2);
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
            while (this.operations.length>0) {
                var operation = this.operations.shift();
                operation[0].apply(this, operation[1]);
            }
        },
        setLocation: function(x, y) {
            this.perform(function(x, y) {
                this.p.x = x + this.p.w / 2;
                this.p.y = y + this.p.h / 2;
            }, [x, y]);
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

    TGraphicalObject.prototype.qInstance = qInstance;
    TGraphicalObject.prototype.qSprite = qInstance.TGraphicalObject;

    TGraphicalObject.prototype.messages = null;

    TGraphicalObject.prototype.getSprite = function() {
        return this.qObject;
    };

    TGraphicalObject.prototype.deleteObject = function() {
        this.qObject.destroy();
        TRuntime.removeGraphicalObject(this);
    };

    TGraphicalObject.prototype.getQObject = function() {
        return this.qObject;
    };

    TGraphicalObject.prototype._setCenterLocation = function(x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.qObject.setCenterLocation(x, y);
    };

    TGraphicalObject.prototype._setLocation = function(x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.qObject.setLocation(x, y);
    };

    TGraphicalObject.prototype.setDesignMode = function(value) {
        var qObject = this.qObject;
        if (value) {
            qObject.on("drag", qObject, "designDrag");
            qObject.on("touchEnd", qObject, "designTouchEnd");
            for (var i = 0; i < qObject.children.length; i++) {
                qObject.children[i].on("drag", qObject, "designDrag");
                qObject.children[i].on("touchEnd", qObject, "designTouchEnd");
            }
            var self = this;
            qObject.p.designCallback = function(x,y) {
                require(["TUI"], function(TUI) {
                    TUI.recordObjectLocation(self, {x:Math.round(x), y:Math.round(y)});
                });
            };
            qObject.p.designMode = true;
        } else {
            qObject.off("drag", qObject, "designDrag");
            qObject.off("touchEnd", qObject, "designTouchEnd");
            for (var i = 0; i < qObject.children.length; i++) {
                qObject.children[i].off("drag", qObject, "designDrag");
                qObject.children[i].off("touchEnd", qObject, "designTouchEnd");
            }
            qObject.p.designCallback = null;
            qObject.p.designMode = false;
        }
    };
    
    TGraphicalObject.prototype.freeze = function(value) {
        this.qObject.freeze(value);
    };
    
    TGraphicalObject.prototype.toString = function() {
        return "TGraphicalObject "+this.className;
    };
    
    TGraphicalObject.prototype._hide = function() {
        this.qObject.p.hidden = true;
    };
    
    TGraphicalObject.prototype._show = function() {
        this.qObject.p.hidden = false;
    };

    return TGraphicalObject;
});