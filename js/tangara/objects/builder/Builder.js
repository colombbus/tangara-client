define(['jquery', 'TUtils', 'SynchronousManager', 'objects/robot/Robot', 'objects/platform/Platform'], function($, TUtils, SynchronousManager, Robot, Platform) {
    /**
     * Defines Builder, inherited from Robot.
     * It's a robot which can deposit tiles.
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
                length: 88,
                platform: [],
                arrayX: 0,
                arrayY: 0,
                nbRows: 0,
                nbColumns: 0,
                x: 18,
                y: 9,
                tiles: 0
            }, props), defaultProps);
        },
        moveForward: function(nb) {
            this.synchronousManager.begin();
            this.perform(function() {
                this.p.inMovement = true;
                this.p.arrayX += nb;
                this.p.destinationX += this.p.length;
            }, [nb]);
        },
        moveBackward: function(nb) {
            this.synchronousManager.begin();
            this.perform(function() {
                this.p.inMovement = true;
                this.p.arrayX -= nb;
                this.p.destinationX -= this.p.length;
            }, [nb]);
        },
        moveUpward: function(nb) {
            this.synchronousManager.begin();
            this.perform(function() {
                this.p.inMovement = true;
                this.p.arrayY -= nb;
                this.p.destinationY -= this.p.length;
            }, [nb]);
        },
        moveDownward: function(nb) {
            this.synchronousManager.begin();
            this.perform(function(nb) {
                this.p.inMovement = true;
                this.p.arrayY += 1;
                this.p.destinationY += this.p.length;
            }, [nb]);
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
            if (this.p.platform[this.p.arrayX][this.p.arrayY] === 0)
                this.p.tiles += 1;
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
     * Move Builder of "number" tiles forward (to the right).
     * If no parameter is given, move it one case forward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Builder.prototype._moveForward = function(number) {
        if (typeof number !== 'undefined') {
            number = TUtils.getInteger(number);
            this.gObject.moveForward(number);
        } else {
            this.gObject.moveForward(1);
        }   
    };

    /**
     * Move Builder of "number" tiles backward (to the left).
     * If no parameter is given, move it one case backward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Builder.prototype._moveBackward = function(number) {
        if (typeof number !== 'undefined') {
            number = TUtils.getInteger(number);
            this.gObject.moveBackward(number);
        } else {
            this.gObject.moveBackward(1);
        }   
    };
   
    /**
     * Move Builder of "number" tiles upward.
     * If no parameter is given, move it one case upward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Builder.prototype._moveUpward = function(number) {
        if (typeof number !== 'undefined') {
            number = TUtils.getInteger(number);
            this.gObject.moveUpward(number);
        } else {
            this.gObject.moveUpward(1);
        }   
    };

    /**
     * Move Builder of "number" tiles downward.
     * If no parameter is given, move it one case downward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Builder.prototype._moveDownward = function(number) {
        if (typeof number !== 'undefined') {
            number = TUtils.getInteger(number);
            this.gObject.moveDownward(number);
        } else {
            this.gObject.moveDownward(1);
        }   
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
