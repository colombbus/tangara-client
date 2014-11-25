define(['jquery', 'babylon', 'TEnvironment', 'TUtils', 'TObject', 'CommandManager'], function($, babylon, TEnvironment, TUtils, TObject, CommandManager) {
    var Space3D = function() {
        engine.runRenderLoop(function() {
            scene.render();
        });
        this.run();
        window.addEventListener("resize", function() {
            engine.resize();
        });
    };

    var canvas = document.getElementById("tcanvas3d");

    var engine = new BABYLON.Engine(canvas, true);

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene, true);

    Space3D.prototype = Object.create(TObject.prototype);
    Space3D.prototype.constructor = Space3D;
    Space3D.prototype.className = "Space3D";
    
    /**
     * 
     */
    Space3D.prototype.addObject = function(obj3D) {
        obj3D.setSpace(scene);
    };
    
    /**
     * 
     * @param TLight3D lg3D
     */
    Space3D.prototype.addLight = function(lg3D) {
    };
    
    /**
     * 
     */
    Space3D.prototype.freeze = function(value) {
        if (value)
            camera.detachControl(canvas);
        else
            camera.attachControl(canvas, true);
    };


    TEnvironment.internationalize(Space3D, true);

    return Space3D;
});


