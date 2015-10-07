define(['objects/platform/Platform', 'TUtils'], function( Platform, TUtils) {
    /**
     * Defines Maze, inherited from Platform.
     * Creates a platform with some basic tiles.
     * @exports Maze
     */
    var Maze = function() {
        Platform.call(this);
        this.addTile("brick.png", this.getResource("brick.png"));
        this.addTile("door.png", this.getResource("wall.png"));
        this.addTile("exit.png", this.getResource("door.png"));
        this.addTile("wall.png", this.getResource("exit.png"));
        this.setCollidableTile(Maze.DOOR, false);
        this.setCollidableTile(Maze.EXIT, false);
        this._build();
    };

    Maze.prototype = Object.create(Platform.prototype);
    Maze.prototype.constructor = Maze;
    Maze.prototype.className = "Maze";
    Maze.GROUND = 0x01;
    Maze.WALL = 0x02;
    Maze.DOOR = 0x03;
    Maze.EXIT = 0x04;

    /*
     * Put a ground at given location
     * @param {Integer} x
     * @param {Integer} y
     */
    Maze.prototype._buildGround = function(x,y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this._setTile(x,y,Maze.GROUND);
    };
    

    /*
     * Build a door at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Maze.prototype._buildDoor = function(x,y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this._setTile(x,y,Maze.DOOR);
        this.setDoorLocation(x,y);
    };

    /*
     * Build an exit at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Maze.prototype._buildExit = function(x,y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this._setTile(x,y,Maze.EXIT);
    };
    
    /*
     * Build an wall at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Maze.prototype._buildWall = function(x,y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this._setTile(x,y,Maze.WALL);
    };

    return Maze;
});



