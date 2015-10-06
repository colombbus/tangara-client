define(['jquery', 'TUtils', 'SynchronousManager', 'objects/robot/Robot', 'objects/platform/Platform'], function($, TUtils, SynchronousManager, Robot, Platform) {
    /**
     * Defines Builder, inherited from Robot.
     * It's a robot which can deposit tiles.
     * @exports Builder
     */
    var Builder = function() {
        Robot.call(this, "builder", false);
        this.synchronousManager = new SynchronousManager();
        this.gObject.synchronousManager = this.synchronousManager;
        var gObject = this.gObject;
        this.platform = new Platform();
        this.platform.addTile("brick.png", this.getResource("brick.png"));
        this.platform.addTile("door.png", this.getResource("door.png"));
        this.platform.addTile("exit.png", this.getResource("exit.png"));
        this.platform.addTile("wall.png", this.getResource("wall.png"));
        this.platform._build();
    };

    Builder.prototype = Object.create(Robot.prototype);
    Builder.prototype.constructor = Builder;
    Builder.prototype.className = "Builder";
    Builder.BRICK = 0x01;
    Builder.DOOR = 0x02;
    Builder.EXIT = 0x03;
    Builder.WALL = 0x04;

    var graphics = Builder.prototype.graphics;

    Builder.prototype.gClass = graphics.addClass("TRobot", "TBuilder", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
            }, props), defaultProps);
        },
        getGridX:function() {
            return this.p.gridX;
        },
        getGridY:function() {
            return this.p.gridY;
        }
    });
    
    /*
     * Put a brick at given location
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Builder.prototype._buildBrick = function(x,y) {
        if (typeof x === 'undefined') {
            x = this.gObject.getGridX();
            y = this.gObject.getGridY();
        } else {
            x = TUtils.getInteger(x);
            y = TUtils.getInteger(y);
        }
        this.platform._setTile(x,y,Builder.BRICK);
    };
    

    /*
     * Build a door at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Builder.prototype._buildDoor = function(x,y) {
        if (typeof x === 'undefined') {
            x = this.gObject.getGridX();
            y = this.gObject.getGridY();
        } else {
            x = TUtils.getInteger(x);
            y = TUtils.getInteger(y);
        }
        this.platform._setTile(x,y,Builder.DOOR);
        this.platform.setDoorLocation(x,y);
    };

    /*
     * Build an exit at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Builder.prototype._buildExit = function(x,y) {
        if (typeof x === 'undefined') {
            x = this.gObject.getGridX();
            y = this.gObject.getGridY();
        } else {
            x = TUtils.getInteger(x);
            y = TUtils.getInteger(y);
        }
        this.platform._setTile(x,y,Builder.EXIT);
    };
    
    /*
     * Build an wall at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Builder.prototype._buildWall = function(x,y) {
        if (typeof x === 'undefined') {
            x = this.gObject.getGridX();
            y = this.gObject.getGridY();
        } else {
            x = TUtils.getInteger(x);
            y = TUtils.getInteger(y);
        }
        this.platform._setTile(x,y,Builder.WALL);
    };
    
    /**
     * Set a new tile image. There can be many tiles.
     * Its value in the structure will depend of the moment where it is added :
     * The first time added will have the value "1", the second "2", etc...
     * @param {String} imageName    Image's name used for tiles
     */
    Builder.prototype._addTile = function(imageName) {
        this.platform._addTile(imageName);
    };
    
    /**
     * Build the Platform inside Builder, and then return it.
     * @returns {Platform}
     */
    Builder.prototype._getPlatform = function() {
        return this.platform;
    };
    
    return Builder;
});
