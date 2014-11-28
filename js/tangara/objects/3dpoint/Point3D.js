define(['jquery', 'babylon', 'TEnvironment', 'TObject'], function($, babylon, TEnvironment, TObject) {
    /**
     * 
     * @return 
     */
    var Point3D = function() {
        TObject.call(this);
    };
    var object3d;
    var name;

    Point3D.prototype = Object.create(TObject.prototype);
    Point3D.prototype.constructor = Point3D;
    Point3D.prototype.className = "Point3D";
    Point3D.prototype.mesh = BABYLON.Mesh;
    Point3D.prototype.instances;

    Point3D.prototype._setSpace = function(scene3d) {
        this.scene = scene3d;
    };

    Point3D.prototype._getX = function() {
    };
    Point3D.prototype._getY = function() {
    };
    Point3D.prototype._getZ = function() {
    }
    ;
    Point3D.prototype._setCoordinates = function(x, y, z) {
    };

    Point3D.prototype._translate = function(x, y, z) {
    };

    Point3D.prototype.toString = function() {
        return "Point3D " + this.className;
    };

    return Point3D;
});

