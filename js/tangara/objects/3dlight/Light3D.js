define(['jquery', 'babylon', 'TEnvironment', 'TObject'], function($, babylon, TEnvironment, TObject) {
    /**
     * 
     * @return 
     */
    var Light3D = function() {
        TObject.call(this);
    };
    //var object3d;
    //var name;

    Light3D.prototype = Object.create(TObject.prototype);
    Light3D.prototype.constructor = Light3D;
    Light3D.prototype.className = "Light3D";

    Light3D.prototype._setSpace = function(scene3d) {
        //this.scene = scene3d;
    };
    Light3D.prototype._setAmbient = function() {
    };
    Light3D.prototype._setColor = function(r, g, b) {
    };
    Light3D.prototype._setDirection = function(direction) {
    };
//    Light3D.prototype._setInfluencingBounds = function(center, 10) {
//    }
//    ;
    Light3D.prototype._setLocation = function(x, y, z) {
    };
    /*Light3D.prototype._setLocation2 = function(0,0,0,50) {};
     Light3D.prototype._setLocation3 = function(point) {};
     Light3D.prototype._setLocation4 = function(point,50) {};*/
    Light3D.prototype._switchOff = function() {
    };
    Light3D.prototype._switchOn = function() {
    };

    return Light3D;
});

