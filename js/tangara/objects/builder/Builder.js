define(['jquery', 'TUtils', 'SynchronousManager', 'objects/robot/Robot', 'objects/platform/Platform'], function($, TUtils, SynchronousManager, Robot, Platform) {
    /**
     * Defines Builder, inherited from Robot.
     * It's a robot which can deposit tiles.
     * @exports Builder
     */
    var Builder = function() {
        Robot.call(this, "builder");
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
                platform: [],
                nbRows: 0,
                nbColumns: 0,
                tiles: 0
            }, props), defaultProps);
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
                        ctx.lineTo((i + 1) * p.length - p.x, (j + 0.4) * p.length - p.y);
                        ctx.lineTo(i * p.length - p.x, (j + 0.4) * p.length - p.y);
                        ctx.closePath();
                        var color = TUtils.getColor(colorsArray[p.platform[i][j]]);
                        ctx.strokeStyle = TUtils.rgbToHex(color);
                        ctx.stroke();
                        ctx.fillStyle = TUtils.rgbToHex(color);
                        ctx.fill();
                        /*ctx.fillStyle = TUtils.rgbToHex(TUtils.reverseColor(color));
                        ctx.textBaseline = "middle";
                        ctx.fillText(p.platform[i][j], (i + 0.5) * p.length - p.x, (j + 0.5) * p.length - p.y);*/
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
