define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Sphere3D
     */
    var Sphere3D = function() {
        
    };
    var object3d;
    var scene;

    Sphere3D.prototype = Object.create(TObject3D.prototype);
    Sphere3D.prototype.constructor = TObject3D;
    Sphere3D.prototype.className = "Sphere3D";
    
    Sphere3D.prototype.setSpace = function(scene3d){
        TObject3D.prototype.setSpace.call(this, scene3d);
        scene = scene3d;
        object3d = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
        object3d.position.y = 1;
    };
    
    TEnvironment.internationalize(Sphere3D, true);

    return Sphere3D;
});

