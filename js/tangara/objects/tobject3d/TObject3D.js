define(['jquery', 'babylon', 'TEnvironment', 'TObject'], function($, babylon, TEnvironment, TObject) {
    /**
     * This object is the 3D parent
     * 
     * @return <code>true</code> if this Object3D is followed by the camera,
     * else <code>false</code>.
     */
    var TObject3D = function() {
        TObject.call(this);
    };
    var object3d;
    //var scene;
    var name;

    TObject3D.prototype = Object.create(TObject.prototype);
    TObject3D.prototype.constructor = TObject3D;
    TObject3D.prototype.className = "TObject3D";
    TObject3D.prototype.mesh = BABYLON.Mesh;
    //TObject3D.prototype.instances;

    TObject3D.prototype.getMesh = function() {
        return this.mesh;
    };

    TObject3D.prototype.freeze = function(value) {
        // every object may add actions to take to freeze
    };
    TObject3D.prototype._hide = function() {
        this.object3d.visibility = true;
    };
    TObject3D.prototype._show = function() {
        this.object3d.visibility = true;
    };
    TObject3D.prototype.getName = function() {
        if (typeof name === 'undefined') {
            //name = this.className + this.instances++;
            name = "objet1";
        }
        return name;
    };
    TObject3D.prototype._setSpace = function(scene3d) {
        this.scene = scene3d;
    };

    TObject3D.prototype._addObject = function(object) {
    };
    TObject3D.prototype._alwaysMoveBackward = function() {

    };
    TObject3D.prototype._alwaysMoveDown = function() {

    };
    TObject3D.prototype._alwaysMoveForward = function() {

    };
    TObject3D.prototype._alwaysMoveLeft = function() {

    };
    TObject3D.prototype._alwaysMoveRight = function() {

    };
    TObject3D.prototype._alwaysMoveUp = function() {

    };
    TObject3D.prototype._displayCollisionArea = function(visibility) {
    };
    TObject3D.prototype._displayCommands = function(state) {
        
    };
    TObject3D.prototype._hide = function() {
    };
    TObject3D.prototype._ifCollision = function(command) {
    };
    TObject3D.prototype._ifCollisionWith = function(e, command) {
    };
    TObject3D.prototype._loadFile = function(file) {
        // file2
    };
    TObject3D.prototype._moveBackward = function() {
    };
    TObject3D.prototype._moveDown = function() {
        // 1 arg : 0
    };
    TObject3D.prototype._moveForward = function() {
        // 1 arg : 0
    };
    TObject3D.prototype._moveLeft = function() {
        // 1 arg : 0
    };
    TObject3D.prototype._moveRight = function() {
        // 1 arg : 0
    };
    TObject3D.prototype._moveUp = function() {
        // 1 arg : 0
    };
    TObject3D.prototype._removeTexture = function() {
    };
    TObject3D.prototype._rotate = function() {
    };
    TObject3D.prototype._setAngle = function() {

    };
    TObject3D.prototype._setCollisionArea = function() {
        // 3 arguments : 1,1,1
    };
    TObject3D.prototype._setColor = function(arg1, arg2) {
        // "red", true
    };
    TObject3D.prototype._setPosition = function(point) {
        // arg 1 : point
    };
    TObject3D.prototype._setRotationAxis = function(axis) {
        // arg : "Y"
    };
    TObject3D.prototype._setScale = function() {
    };
    TObject3D.prototype._setSolid = function(solidnessState) {
    };
    TObject3D.prototype._setSpeed = function() {
        // speed : 10
    };
    TObject3D.prototype._setTexture = function(texture) {
    };
    TObject3D.prototype._show = function() {
    };
    TObject3D.prototype._stop = function() {
    };
    TObject3D.prototype._translate = function() {
        // arg : 0,0,0
    };

    TObject3D.prototype.toString = function() {
        return "TObject3D " + this.className;
    };

    return TObject3D;
});

