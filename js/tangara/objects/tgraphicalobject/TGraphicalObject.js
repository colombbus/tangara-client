define(['jquery', 'jquery_animate_enhanced', 'TEnvironment', 'TObject'], function($, animate_enhanced, TEnvironment, TObject) {
    function TGraphicalObject() {
        this.qObject = new this.qSprite();
        TObject.call(this);
        var canvas = TEnvironment.getCanvas();
        canvas.addGraphicalObject(this);
    }

    TGraphicalObject.prototype = new TObject();
    TGraphicalObject.prototype.constructor = TGraphicalObject;

    TGraphicalObject.prototype.className = "TGraphicalObject";
    TGraphicalObject.TYPE_CHARACTER = 0x0100;
    TGraphicalObject.TYPE_CATCHABLE = 0x0200;
    TGraphicalObject.TYPE_SPRITE = 0x0400;
    TGraphicalObject.TYPE_INPUT = 0x0800;

    var qInstance = TEnvironment.getQuintusInstance();

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
            for (var i = 0; i < this.operations.length; i++) {
                var operation = this.operations[i];
                operation[0].apply(this, operation[1]);
            }
            this.operations = new Array();
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
        }
    });

    TGraphicalObject.prototype.qSprite = qInstance.TGraphicalObject;

    TGraphicalObject.prototype.messages = null;

    TGraphicalObject.prototype.getSprite = function() {
        return this.qObject;
    };

    TGraphicalObject.prototype.deleteObject = function() {
        var canvas = TEnvironment.getCanvas();
        canvas.removeGraphicalObject(this);
        this.getQObject().destroy();
        TEnvironment.deleteTObject(this);
    };

    TGraphicalObject.prototype.getQObject = function() {
        return this.qObject;
    };

    TGraphicalObject.prototype._setCenterLocation = function(x, y) {
        if (typeof x === 'number' && typeof y === 'number') {
            this.qObject.setCenterLocation(x, y);
        }
    };

    TGraphicalObject.prototype._setLocation = function(x, y) {
        if (typeof x === 'number' && typeof y === 'number') {
            this.qObject.setLocation(x, y);
        }
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
            qObject.p.designMode = true;
        } else {
            qObject.off("drag", qObject, "designDrag");
            qObject.off("touchEnd", qObject, "designTouchEnd");
            for (var i = 0; i < qObject.children.length; i++) {
                qObject.children[i].off("drag", qObject, "designDrag");
                qObject.children[i].off("touchEnd", qObject, "designTouchEnd");
            }
            qObject.p.designMode = false;
        }
    };

    return TGraphicalObject;
});