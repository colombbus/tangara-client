define(['jquery', 'babylon', 'TEnvironment', 'TUtils', 'TGraphicalObject', 'CommandManager'], function($, babylon, TEnvironment, TUtils, TGraphicalObject, CommandManager) {
    var Space3D = function() {
        TGraphicalObject.call(this);
        //this._setLocation(0,0);
        var canvas = document.getElementById("tcanvas3d");
		
        var engine = new BABYLON.Engine(canvas, true);

        var createScene = function() {
            var scene = new BABYLON.Scene(engine);
        
            var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
        
            var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
            light.intensity = 0.7;
        
            var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
            sphere.position.y = 1;
        
            var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
        
            return scene;
        };
        
        var scene = createScene();

        engine.runRenderLoop(function() {
            scene.render();
        });

        window.addEventListener("resize", function() {
            engine.resize();
        });
    };

    Space3D.prototype = Object.create(TGraphicalObject.prototype);
    Space3D.prototype.constructor = Space3D;
    Space3D.prototype.className = "Space3D";

    Space3D.prototype._moveForward = function(value) {
        value = TUtils.getInteger(value);
    };
	
    TEnvironment.internationalize(Space3D, true);

    return Space3D;
});



