define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Cylinder3D
     */
    var Cylinder3D = function(sizeX, sizeY, sizeZ, colorName) {
        /*
         this.object3d.position.x = sizeX;
         this.object3d.position.y = sizeY;
         this.object3d.position.z = sizeZ;
         */
    };

    Cylinder3D.prototype = Object.create(TObject3D.prototype);
    Cylinder3D.prototype.constructor = Cylinder3D;
    Cylinder3D.prototype.className = "Cylinder3D";

    Cylinder3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        this.object3d = this.getMesh().CreateCylinder(this.getName(), 3, 1, 1, 16, this.scene);
        this.object3d.position.y = 1;
    };

    Cylinder3D.prototype._setHeight = function(height) {
    };
    Cylinder3D.prototype._setRadius = function(radius) {
    };

    TEnvironment.internationalize(Cylinder3D, true);

    return Cylinder3D;
});

/* 
 e=new Espace3D()
 c=new Cylindre3D()
 e.addObject(c)
 c.cacher()
 
 e=new Espace3D()
 c=new Cylindre3D()
 d=new Cylindre3D()
 e.addObject(c)
 tangara.écrire("nom " + d.getName())
 
 */