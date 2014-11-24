define(['jquery', 'babylon', 'TEnvironment', 'TObject'], function($, babylon, TEnvironment, TObject) {
    var TObject3D = function() {
        TObject.call(this);
    };

    var mesh = new BABYLON.Mesh;
    
    TObject3D.prototype.objectName;
    TObject3D.prototype.className = "TObject3D";

    TObject3D.prototype.getMesh = function (){
        return mesh;
    };
    TObject3D.prototype.freeze = function(value) {
        // every object may add actions to take to freeze
    };
    
    TObject3D.prototype.toString = function() {
        return "TObject3D " + this.className;
    };
    return TObject3D;
});

