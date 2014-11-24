define(['jquery', 'babylon', 'TEnvironment', 'TObject'], function($, babylon, TEnvironment, TObject) {
    var Torus3D = function(space3d) {
        var scene = space3d.getScene();
        var cylinder = BABYLON.Mesh.CreateTorus("torus1", 6, 1, 36, scene, true);
        cylinder.position.y = 1;
    };
    Torus3D.prototype = Object.create(TObject.prototype);
    Torus3D.prototype.constructor = TObject;
    Torus3D.prototype.className = "Torus3D";

    TEnvironment.internationalize(Torus3D, true);

    return Torus3D;
});

