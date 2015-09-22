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
    Builder.BRICK = 0x01;
    Builder.DOOR = 0x02;
    Builder.EXIT = 0x03;

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
        addRows: function(y) {
            if (typeof y === 'undefined') {
                y = this.p.gridY;
            }
            for (var i = this.p.nbRows ; i <= y ; i++) {
                for (var j = 0 ; j <= this.p.nbColumns ; j++) {
                    this.p.platform[j][i] = 0;
                }
            };
            this.p.nbRows = i;
        },
        addColumn: function(i) {
            var column = [];
            for (var j = 0 ; j <= this.p.nbRows ; j++) {
                    column[j] = 0;
            }
            this.p.platform[i] = column;
        },
        addColumns: function(x) {
            if (typeof x === 'undefined') {
                x = this.p.gridX;
            }
            for (var i = this.p.nbColumns ; i <= x ; i++) {
                this.addColumn(i);
            };
            this.p.nbColumns = i;
        },
        addTile: function(number, x, y) {
            if (typeof x === 'undefined') {
                x = this.p.gridX;
                y = this.p.gridY;
            }
            if (this.p.platform[x][y] === 0)
                this.p.tiles += 1;
            this.p.platform[x][y] = number;
        },
        draw: function(ctx) {
            var p = this.p;
            for (var i = 0; i < p.nbColumns ; i++)
            {
                for (var j = 0 ; j < p.nbRows ; j++)
                {
                    if (p.platform[i][j]) {
                        ctx.beginPath();
                        ctx.moveTo(i * p.length - p.x, j * p.length - p.y);
                        ctx.lineTo((i + 1) * p.length - p.x, j * p.length - p.y);
                        switch (p.platform[i][j]) {
                            case Builder.BRICK: 
                                ctx.lineTo((i + 1) * p.length - p.x, (j + 0.4) * p.length - p.y);
                                ctx.lineTo(i * p.length - p.x, (j + 0.4) * p.length - p.y);
                                ctx.closePath();
                                ctx.strokeStyle = "#000000";
                                ctx.stroke();
                                ctx.fillStyle = "#000000";
                                ctx.fill();
                                break;
                            case Builder.DOOR:
                                ctx.lineTo((i + 1) * p.length - p.x, (j + 1) * p.length - p.y);
                                ctx.lineTo(i * p.length - p.x, (j + 1) * p.length - p.y);
                                ctx.closePath();
                                ctx.strokeStyle = "#8b6f37";
                                ctx.stroke();
                                ctx.fillStyle = "#8b6f37";
                                ctx.fill();
                                break;
                            case Builder.EXIT:
                                ctx.lineTo((i + 1) * p.length - p.x, (j + 1) * p.length - p.y);
                                ctx.lineTo(i * p.length - p.x, (j + 1) * p.length - p.y);
                                ctx.closePath();
                                ctx.strokeStyle = "#00FF00";
                                ctx.stroke();
                                ctx.fillStyle = "#00FF00";
                                ctx.fill();
                                break;
                        }
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
     * 
     */
    
    /*
     * Put a brick at given location
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Builder.prototype._build = function(x,y) {
        var p = this.gObject.p;
        if (typeof x === 'undefined') {
            x = p.gridX;
            y = p.gridY;
        } else {
            x = TUtils.getInteger(x);
            y = TUtils.getInteger(y);
        }
        if (x >= p.nbColumns) {
            this.gObject.addColumns(x);
        }
        if (y >= p.nbRows) {
            this.gObject.addRows(y);
        }
        this.gObject.addTile(Builder.BRICK,x,y);
    };
    

    /*
     * Build a door at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Builder.prototype._setDoor = function(x,y) {
        var p = this.gObject.p;
        if (typeof x === 'undefined') {
            x = p.gridX;
            y = p.gridY;
        } else {
            x = TUtils.getInteger(x);
            y = TUtils.getInteger(y);
        }
        if (x >= p.nbColumns) {
            this.gObject.addColumns(x);
        }
        if (y >= p.nbRows) {
            this.gObject.addRows(y);
        }
        this.gObject.addTile(Builder.DOOR,x,y);
    };

    /*
     * Build an exit at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Builder.prototype._setExit = function(x,y) {
        var p = this.gObject.p;
        if (typeof x === 'undefined') {
            x = p.gridX;
            y = p.gridY;
        } else {
            x = TUtils.getInteger(x);
            y = TUtils.getInteger(y);
        }        
        if (x >= p.nbColumns) {
            this.gObject.addColumns(x);
        }
        if (y >= p.nbRows) {
            this.gObject.addRows(y);
        }
        this.gObject.addTile(Builder.EXIT,x,y);
    };
    
    
    /**
     * Get platform structure
     * @returns array
     */
    Builder.prototype._getStructure = function() {
        // TODO: correct p.platform order
        // invert platform
        var p = this.gObject.p.platform;
        var p2 = [];
        
        if (p.length>0 && p[0].length>0) {
            var cols = p.length;
            var rows = p[0].length;
            for (var i=0;i<rows;i++) {
                p2[i] = [];
                for (var j=0;j<cols;j++) {
                    if (p[j][i] === Builder.BRICK) {
                        p2[i][j] = Builder.BRICK;
                    } else {
                        p2[i][j] = 0;
                    }
                }
            }
            return p2;
        } else {
            return [[]];
        }
    };
    
    return Builder;
});
