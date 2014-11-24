define(['jquery', 'babylon', 'TEnvironment', 'TObject'], function($, babylon, TEnvironment, TObject) {
    var Cylinder3D = function(space3d) {
        var scene = space3d.getScene();
        var cylinder = BABYLON.Mesh.CreateCylinder("cylinder1", 3, 1, 1, 16, scene);
        cylinder.position.y = 1;
    };
    Cylinder3D.prototype = Object.create(TObject.prototype);
    Cylinder3D.prototype.constructor = TObject;
    Cylinder3D.prototype.className = "Cylinder3D";

    TEnvironment.internationalize(Cylinder3D, true);

    return Cylinder3D;
});

