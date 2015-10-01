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
        this.platform = new Platform();
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
        addRow: function() {
            var p = this.p;
            p.platform[p.nbRows] = [];
            for (var j=0; j< p.nbColumns; j++) {
                p.platform[p.nbRows][j] = 0;
            }
            p.nbRows++;
        },
        addColumn: function() {
            var p = this.p;
            for (var i=0; i< p.nbRows; i++) {
                p.platform[i][p.nbColumns] = 0;
            }
            p.nbColumns++;
        },
        addRows: function(y) {
            var p = this.p;
            if (typeof y === 'undefined') {
                y = p.gridY;
            }
            for (var i= p.nbRows ; i<=y ; i++) {
                this.addRow();
            }
        },
        addColumns: function(x) {
            var p = this.p;
            if (typeof x === 'undefined') {
                x = p.gridX;
            }
            for (var j= p.nbColumns ; j<=x ; j++) {
                this.addColumn();
            }
        },
        addTile: function(number, x, y) {
            if (typeof x === 'undefined') {
                x = this.p.gridX;
                y = this.p.gridY;
            }
            if (this.p.platform[y][x] === 0)
                this.p.tiles += 1;
            this.p.platform[y][x] = number;
        },
        draw: function(ctx) {
            var p = this.p;
            for (var i = 0; i < p.nbRows ; i++)
            {
                for (var j = 0 ; j < p.nbColumns ; j++)
                {
                    if (p.platform[i][j]) {
                        ctx.beginPath();
                        ctx.moveTo(j * p.length - p.x, i * p.length - p.y);
                        ctx.lineTo((j + 1) * p.length - p.x, i * p.length - p.y);
                        switch (p.platform[i][j]) {
                            case Builder.BRICK: 
                                ctx.lineTo((j + 1) * p.length - p.x, (i + 0.4) * p.length - p.y);
                                ctx.lineTo(j * p.length - p.x, (i + 0.4) * p.length - p.y);
                                ctx.closePath();
                                ctx.strokeStyle = "#000000";
                                ctx.stroke();
                                ctx.fillStyle = "#000000";
                                ctx.fill();
                                break;
                            case Builder.DOOR:
                                ctx.lineTo((j + 1) * p.length - p.x, (i + 1) * p.length - p.y);
                                ctx.lineTo(j * p.length - p.x, (i + 1) * p.length - p.y);
                                ctx.closePath();
                                ctx.strokeStyle = "#8b6f37";
                                ctx.stroke();
                                ctx.fillStyle = "#8b6f37";
                                ctx.fill();
                                break;
                            case Builder.EXIT:
                                ctx.lineTo((j + 1) * p.length - p.x, (i + 1) * p.length - p.y);
                                ctx.lineTo(j * p.length - p.x, (i + 1) * p.length - p.y);
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
        var p = this.gObject.p.platform;
        var p2 = [];
        
        if (p.length>0 && p[0].length>0) {
            var cols = p[0].length;
            for (var i=0; i<p.length ; i ++) {
                p2[i] = [];
                for (var j=0; j<cols; j++) {
                    if (p[i][j] === Builder.BRICK) {
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
    
    Builder.prototype._buildStructure = function() {
        this.platform._loadStructure(this._getStructure());
        this.platform._build();
    };
    
    return Builder;
});
