define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Box3D
     */
    var Box3D = function() {
        
    };
    var object3d;
    var scene;

    Box3D.prototype = Object.create(TObject3D.prototype);
    Box3D.prototype.constructor = TObject3D;
    Box3D.prototype.className = "Box3D";
    
    Box3D.prototype.setSpace = function(scene3d){
        TObject3D.prototype.setSpace.call(this, scene3d);
        scene = scene3d;
        object3d = BABYLON.Mesh.CreateBox("box1", 2, scene);
        object3d.position.y = 1;
    };
    
    TEnvironment.internationalize(Box3D, true);

    return Box3D;
});

