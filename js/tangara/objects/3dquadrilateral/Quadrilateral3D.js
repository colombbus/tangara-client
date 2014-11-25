define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Quadrilateral3D
     */
    var Quadrilateral3D = function() {
        
    };
    var object3d;
    var scene;

    Quadrilateral3D.prototype = Object.create(TObject3D.prototype);
    Quadrilateral3D.prototype.constructor = TObject3D;
    Quadrilateral3D.prototype.className = "Quadrilateral3D";
    
    Quadrilateral3D.prototype.setSpace = function(scene3d){
        TObject3D.prototype.setSpace.call(this, scene3d);
        scene = scene3d;
        //object3d = BABYLON.Mesh.CreateCylinder("cylinder1", 3, 1, 1, 16, scene);
        object3d.position.y = 1;
    };
    
    TEnvironment.internationalize(Quadrilateral3D, true);

    return Quadrilateral3D;
});

