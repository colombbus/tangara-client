define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Cylinder3D
     */
    var Cylinder3D = function(sizeX, sizeY, sizeZ, colorName) {
        
        
    };

    Cylinder3D.prototype = Object.create(TObject3D.prototype);
    Cylinder3D.prototype.constructor = Cylinder3D;
    Cylinder3D.prototype.className = "Cylinder3D";
    
    /**
     * 
     * @param  scene3d
     */
    Cylinder3D.prototype.setSpace = function(scene3d){
        TObject3D.prototype.setSpace.call(this, scene3d);
        this.object3d = this.getMesh().CreateCylinder("cylinder1", 3, 1, 1, 16, this.scene);
        this.object3d.position.y = 1;
    };
    /* 
e=new Espace3D()
c=new Cylindre3D()
e.addObject(c)
c.supprimer()
     */
    Cylinder3D.prototype.freeze = function(value) {
        // every object may add actions to take to freeze
    };
    TEnvironment.internationalize(Cylinder3D, true);

    return Cylinder3D;
});

