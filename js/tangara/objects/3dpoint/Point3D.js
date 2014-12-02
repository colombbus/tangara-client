define(['jquery', 'TEnvironment', 'TObject3D'], function($, TEnvironment, TObject3D) {
    /**
     *  A Point3D is a basic 3D element but a complex object can:
     *  -set a name
     *  -be displayed in Space3D as 3 Segment3D 
     *  
     *  Another Point3D can defined a Point3D
     *  
     * @return Point3D 
     */
    var Point3D = function(x, y, z) {
        this._setCoordinates(x, y, z);
        var xlines;
        var ylines;
        var zlines;
    };
    var pointX;
    var pointY;
    var pointZ;
    var name;

    Point3D.prototype = Object.create(TObject3D.prototype);
    Point3D.prototype.constructor = Point3D;
    Point3D.prototype.className = "Point3D";

    // TODO: display name in Space3D
    Point3D.prototype._getName = function() {
        return this.name;
    };
    Point3D.prototype._setName = function(n) {
        this.name = n;
    };
    Point3D.prototype._getX = function() {
        return this.pointX;
    };
    Point3D.prototype._getY = function() {
        return this.pointX;
    };
    Point3D.prototype._getZ = function() {
        return this.pointZ;
    };
    Point3D.prototype._setX = function(x) {
        if (typeof x === 'undefined')
            this.pointX = 0;
        else
            this.pointX = x;
    };
    Point3D.prototype._setY = function(y) {
        if (typeof y === 'undefined')
            this.pointY = 0;
        else
            this.pointY = y;
    };
    Point3D.prototype._setZ = function(z) {
        if (typeof z === 'undefined')
            this.pointZ = 0;
        else
            this.pointZ = z;
    };
    Point3D.prototype._setCoordinates = function(x, y, z) {
        if (typeof x === 'object' || x instanceof Point3D) {
            var point = x;
            this._setX(point._getX());
            this._setY(point._getY());
            this._setZ(point._getZ());
        } else {
            this._setX(x);
            this._setY(y);
            this._setZ(z);
        }
    };

    Point3D.prototype._translate = function(x, y, z) {
    };
    
    Point3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        // Display name & 3 segments
        this.xlines = BABYLON.Mesh.CreateLines("xline", [
            new BABYLON.Vector3(1 + this._getX(), this._getY(), this._getZ()),
            new BABYLON.Vector3(-1 + this._getX(), this._getY(), this._getZ())
        ], this.scene);
        this.xlines.color = new BABYLON.Color3(1, 0, 0); //red

        this.ylines = BABYLON.Mesh.CreateLines("yline", [
            new BABYLON.Vector3(this._getX(), this._getY(), this._getZ()) + new BABYLON.Vector3(0, 1 , 0),
            new BABYLON.Vector3(this._getX(), -1 + this._getY(), this._getZ())
        ], this.scene);
        this.ylines.color = new BABYLON.Color3(0, 0, 1); //blue
        this.zlines = BABYLON.Mesh.CreateLines("zline", [
            new BABYLON.Vector3(this._getX(), this._getY(), 1 + this._getZ()),
            new BABYLON.Vector3(this._getX(), this._getY(), -1 + this._getZ())
        ], this.scene);
        this.zlines.color = new BABYLON.Color3(0, 1, 0); //green
    };
    
    Point3D.prototype.toString = function() {
        return "Point3D";
    };

    return Point3D;
});

/*
 * TESTS
 o=new Point3D()
 tangara.écrire("x : " + o._getX())
 
 p=new Point3D(1,2,3)
 tangara.écrire("x : " + p._getX())
 p._setX(5)
 tangara.écrire("x : " + p._getX())
 p._setCoordinates(o)
 tangara.écrire("x : " + p._getX())
 
 o._setX(8)
 q=new Point3D(o)
 tangara.écrire("x : " + q._getX())
 * 
 */