define(['jquery', 'babylon', 'TEnvironment', 'TUtils', 'TObject', 'CommandManager'], function($, babylon, TEnvironment, TUtils, TObject, CommandManager) {
    var Sphere3D = function(space3d) {
        var scene = space3d.getScene();
        var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
        matos = new BABYLON.StandardMaterial("texture1", scene);
        matos.diffuseColor = new BABYLON.Color3.Red();
        sphere.material = matos;
        sphere.position.y = 1;
    };
    
    Sphere3D.prototype = Object.create(TObject.prototype);
    Sphere3D.prototype.constructor = TObject;
    Sphere3D.prototype.className = "Sphere3D";

    TEnvironment.internationalize(Sphere3D, true);

    return Sphere3D;
});

