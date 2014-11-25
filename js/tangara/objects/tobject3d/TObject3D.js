define(['jquery', 'babylon', 'TEnvironment', 'TObject'], function($, babylon, TEnvironment, TObject) {
    var TObject3D = function() {
        TObject.call(this);
    };

    var mesh = BABYLON.Mesh;
    var object3d;
    var scene;
    
    TObject3D.prototype = Object.create(TObject.prototype);
    TObject3D.prototype.constructor = TObject3D;
    TObject3D.prototype.className = "TObject3D";

    TObject3D.prototype.getMesh = function (){
        return this.mesh;
    };
    
    TObject3D.prototype.getObject3D = function (){
        return this.object3d;
    };
    
    TObject3D.prototype.setObject3D = function (thisObject){
        this.object3d = thisObject;
    };
    
    TObject3D.prototype.freeze = function(value) {
        // every object may add actions to take to freeze
    };
    TObject3D.prototype._delete = function() {
        this.object3d.dispose();
    };
    
    /**
     * 
     * @param Space3D space
     */
    TObject3D.prototype.setSpace = function(scene3d){
        this.scene = scene3d;
    };
    
    TObject3D.prototype.toString = function() {
        return "TObject3D " + this.className;
    };
    return TObject3D;
});

