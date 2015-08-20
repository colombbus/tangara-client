define(['jquery', 'TUtils', 'SynchronousManager', 'objects/robot/Robot', 'objects/platform/Platform'], function($, TUtils, SynchronousManager, Robot, Platform) {
    /**
     * Defines Builder, inherited from Robot.
     * The main difference with Robot is that it executes commands one by one.
     * @exports Builder
     */
    var Builder = function() {
        Robot.call(this, "robot");
        this.step = 50;
        this.synchronousManager = new SynchronousManager();
        this.gObject.synchronousManager = this.synchronousManager;
        var gObject = this.gObject;
    };

    Builder.prototype = Object.create(Robot.prototype);
    Builder.prototype.constructor = Builder;
    Builder.prototype.className = "Builder";

    var graphics = Builder.prototype.graphics;

    Builder.prototype.gClass = graphics.addClass("TRobot", "TBuilder", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                length: 128,
                platform: [],
                arrayX: 0,
                arrayY: 0,
                nbRows: 0,
                nbColumns: 0,
                x: 38,
                y: 29
            }, props), defaultProps);
        },
        moveForward: function() {
            this.synchronousManager.begin();
            this.perform(function() {
                this.p.inMovement = true;
                this.p.arrayX += 1;
                this.p.destinationX += this.p.length;
            }, []);
        },
        moveBackward: function() {
            this.synchronousManager.begin();
            this.perform(function() {
                this.p.inMovement = true;
                this.p.arrayX -= 1;
                this.p.destinationX -= this.p.length;
            }, []);
        },
        moveUpward: function() {
            this.synchronousManager.begin();
            this.perform(function() {
                this.p.inMovement = true;
                this.p.arrayY -= 1;
                this.p.destinationY -= this.p.length;
            }, []);
        },
        moveDownward: function() {
            this.synchronousManager.begin();
            this.perform(function() {
                this.p.inMovement = true;
                this.p.arrayY += 1;
                this.p.destinationY += this.p.length;
            }, []);
        },
        addRows: function() {
            for (var i = this.p.nbRows ; i <= this.p.arrayY ; i++) {
                for (var j = 0 ; j <= this.p.arrayX ; j++) {
                    this.p.platform[j][i] = 0;
                }
            };
            this.p.nbRows = i;
        },
        addColumn: function(i) {
            var column = [];
            for (var j = 0 ; j <= this.p.arrayY ; j++) {
                    column[j] = 0;
            }
            this.p.platform[i] = column;
        },
        addColumns: function() {
            for (var i = this.p.nbColumns ; i <= this.p.arrayX ; i++) {
                this.addColumn(i);
            };
            this.p.nbColumns = i;
        },
        addTile: function(number) {
            this.p.platform[this.p.arrayX][this.p.arrayY] = number;
        },
        draw: function(ctx) {
            var p = this.p;
            var colorsArray = ["blanc", "noir", "rouge", "vert citron", "bleu", "jaune", "cyan", "fuchsia", "argent", "gris", "marron", "vert olive", "vert", "pourpre", "bleu canard", "outremer", "beige", "violet", "vert foncé", "violet", "indigo", "vert clair", "orange", "rose", "bleu ciel", "orange"];

            for (var i = 0; i < p.nbColumns ; i++)
            {
                for (var j = 0 ; j < p.nbRows ; j++)
                {
                    if (p.platform[i][j]) {
                        ctx.beginPath();
                        ctx.moveTo(i * p.length - p.x, j * p.length - p.y);
                        ctx.lineTo((i + 1) * p.length - p.x, j * p.length - p.y);
                        ctx.lineTo((i + 1) * p.length - p.x, (j + 1) * p.length - p.y);
                        ctx.lineTo(i * p.length - p.x, (j + 1) * p.length - p.y);
                        ctx.closePath();
                        var color = TUtils.getColor(colorsArray[p.platform[i][j]]);
                        ctx.strokeStyle = TUtils.rgbToHex(color);
                        ctx.stroke();
                        ctx.fillStyle = TUtils.rgbToHex(color);
                        ctx.fill();
                        ctx.fillStyle = TUtils.rgbToHex(TUtils.reverseColor(color));
                        ctx.textBaseline = "middle";
                        ctx.fillText(p.platform[i][j], (i + 0.5) * p.length - p.x, (j + 0.5) * p.length - p.y);
                    }
                }
            }

            if (p.sheet) {
                this.sheet().draw(ctx, -p.cx, -p.cy, p.frame);
            } else if (p.asset) {
                ctx.drawImage(this.resources.getUnchecked(p.asset), -p.cx, -p.cy);
            }
        }
    });
    
    /**
     * Move Builder of "length" pixels forward (to the right).
     */
    Builder.prototype._moveForward = function() {
        this.gObject.moveForward();
    };

    /**
     * Move Builder of "length" pixels backward (to the left).
     */
    Builder.prototype._moveBackward = function() {
        this.gObject.moveBackward();
    };
    
    /**
     * Move Builder of "length" pixels upward.
     */
    Builder.prototype._moveUpward = function() {
        this.gObject.moveUpward();
    };
    
    /**
     * Move Builder of "length" pixels downward.
     */
    Builder.prototype._moveDownward = function() {
        this.gObject.moveDownward();
    };

    /**
     * Put a brick.
     * @param {Number} number
     */
    Builder.prototype._build = function(number) {
        var p = this.gObject.p;
        if (p.arrayX >= p.nbColumns) {
            this.gObject.addColumns();
        }
        if (p.arrayY >= p.nbRows) {
            this.gObject.addRows();
        }
        if (typeof number === 'undefined') {
            number = 1;
        }
        this.gObject.addTile(number);
    };
    
    return Builder;
});
