define(['jquery', 'babylon', 'TEnvironment', 'TObject'], function($, babylon, TEnvironment, TObject) {
    /**
     * This object is the 3D parent
     * 
     * @return <code>true</code> if this Object3D is followed by the camera,
     * else <code>false</code>.
     */
    var TObject3D = function() {
        TObject.call(this);
        {
            instances : 0;
        }
        ;

    };
    var object3d;
    //var scene;
    var name;

    TObject3D.prototype = Object.create(TObject.prototype);
    TObject3D.prototype.constructor = TObject3D;
    TObject3D.prototype.className = "TObject3D";
    TObject3D.prototype.mesh = BABYLON.Mesh;
    TObject3D.prototype.instances;

    TObject3D.prototype.getMesh = function() {
        return this.mesh;
    };
    /*
     e=new Espace3D()
     c=new Cylindre3D()
     e.addObject(c)
     */
    TObject3D.prototype.getObject3D = function() {
        return this.object3d;
    };
    TObject3D.prototype.setObject3D = function(thisObject) {
        this.object3d = thisObject;
    };
    TObject3D.prototype.freeze = function(value) {
        // every object may add actions to take to freeze
    };
    TObject3D.prototype._hide = function() {
        this.object3d.visibility = false;
    };
    TObject3D.prototype._show = function() {
        this.object3d.visibility = true;
    };
    TObject3D.prototype.getName = function() {
        if (typeof name === 'undefined') {
            name = this.className + this.instances++;
        }
        return name;
    };
    /**
     e=new Espace3D()
     c=new Cylindre3D()
     d=new Cylindre3D()
     e.addObject(c)
     e.addObject(d)
     tangara.écrire("nom " + c.getName())
     tangara.écrire("nom " + d.getName())
     * @param Space3D space
     */
    TObject3D.prototype._setSpace = function(scene3d) {
        this.scene = scene3d;
    };



    TObject3D.prototype._addObject = function(object) {
    };
//TObject3D.prototype._alwaysMoveBackward  {};
//TObject3D.prototype._alwaysMoveDown  {};
//TObject3D.prototype._alwaysMoveForward  {};
//TObject3D.prototype._alwaysMoveLeft  {};
//TObject3D.prototype._alwaysMoveRight  {};
//TObject3D.prototype._alwaysMoveUp  {};
    TObject3D.prototype._displayCollisionArea = function(visibility) {
    };
//TObject3D.prototype._displayCommands = function(true) {};
    TObject3D.prototype._hide = function() {
    };
    TObject3D.prototype._ifCollision = function(command) {
    };
    TObject3D.prototype._ifCollisionWith = function(e, command) {
    };
    TObject3D.prototype._loadFile = function(file) {
    };
    TObject3D.prototype._loadFile2 = function(file) {
    };
    TObject3D.prototype._moveBackward = function() {
    };
//TObject3D.prototype._moveDown = function(0) {};
//TObject3D.prototype._moveForward = function(0) {};
//TObject3D.prototype._moveLeft = function(0) {};
//TObject3D.prototype._moveRight = function(0) {};
//TObject3D.prototype._moveUp = function(0) {};
    TObject3D.prototype._removeTexture = function() {
    };
    TObject3D.prototype._rotate = function() {
    };
//TObject3D.prototype._setAngle = function(0) {};
//TObject3D.prototype._setCollisionArea = function(1,1,1) {};
//TObject3D.prototype._setCollisionArea2 = function(1) {};
//TObject3D.prototype._setColor = function("red") {};
//TObject3D.prototype._setColor2 = function("red",1) {};
//TObject3D.prototype._setPosition = function(0,0,0) {};
    TObject3D.prototype._setPosition2 = function(point) {
    };
//TObject3D.prototype._setRotationAxis = function("Y") {};
    TObject3D.prototype._setScale = function() {
    };
    TObject3D.prototype._setSolid = function(solidnessState) {
    };
//TObject3D.prototype._setSpeed = function(10) {};
    TObject3D.prototype._setTexture = function(texture) {
    };
    TObject3D.prototype._show = function() {
    };
    TObject3D.prototype._stop = function() {
    };
//TObject3D.prototype._translate = function(0,0,0) {};


    TObject3D.prototype.toString = function() {
        return "TObject3D " + this.className;
    };

    return TObject3D;
});

