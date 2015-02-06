define(['jquery', 'babylon', 'TEnvironment', 'TUtils', 'TObject', 'CommandManager'], function($, babylon, TEnvironment, TUtils, TObject, CommandManager) {
    var Space3D = function() {
        if (!TEnvironment.is3DSupported()) {
            throw new Error(this.getMessage("error-3d-not-supported"));
        }
        this.scene = new BABYLON.Scene(engine);
        this.camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), this.scene);
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);
        this.light.intensity = 0.7;
        this.ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, this.scene, true);
        this.sceneIndex = scenes.length;
        scenes.push(this.scene);
        if (this.sceneIndex === 0) {
            // first space to be displayed: show canvas
            $canvas.show();
        }
        TObject.call(this);
    };

    var canvas = document.getElementById("tcanvas3d");
    var $canvas = $(canvas);
    var engine;
    var scenes = [];
    if (TEnvironment.is3DSupported()) {
        engine = new BABYLON.Engine(canvas, true);
        engine.runRenderLoop(function() {
            for (var i=0; i<scenes.length; i++) {
                scenes[i].render();
            }
        });
        window.addEventListener("resize", function() {
            engine.resize();
        });
    }
    
    

    // hide canvas at the beginning
    $canvas.hide();

    Space3D.prototype = Object.create(TObject.prototype);
    Space3D.prototype.constructor = Space3D;
    Space3D.prototype.className = "Space3D";

    Space3D.prototype._addObject = function(obj3D) {
        obj3D._setSpace(this.scene);
    };

    Space3D.prototype.addLight = function(lg3D) {
    };

    Space3D.prototype.freeze = function(value) {
        if (value)
            this.camera.detachControl(canvas);
        else
            this.camera.attachControl(canvas, true);
    };

    Space3D.prototype.deleteObject = function() {
        TObject.prototype.deleteObject.call(this);
        scenes.splice(this.sceneIndex,1);
        this.scene.dispose();
        if (scenes.length === 0) {
            // no more spaces to show: hide canvas
            $canvas.hide();
        }
    };
    
    TEnvironment.internationalize(Space3D, true);

    return Space3D;
});

/*
 define(['jquery', 'babylon', 'TEnvironment', 'TUtils', 'TObject', 'CommandManager'], function($, babylon, TEnvironment, TUtils, TObject, CommandManager) {
 var Space3D = function() {
 
 //        engine.runRenderLoop(function() {
 //            scene.render();
 //        });
 var canvas = document.getElementById("tcanvas3d");
 
 var engine = new BABYLON.Engine(canvas, true);
 //var scene = new BABYLON.Scene(engine);
 
 var scene = new BABYLON.Scene(engine);
 
 BABYLON.SceneLoader.Load("", this.getResource("untitled.babylon"), engine, function(scene) {
 // Wait for textures and shaders to be ready
 scene.executeWhenReady(function() {
 // Attach camera to canvas inputs
 
 var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
 camera.setTarget(BABYLON.Vector3.Zero());
 scene.activeCamera.attachControl(canvas);
 // Once the scene is loaded, just register a render loop to render it
 engine.runRenderLoop(function() {
 scene.render();
 });
 });
 }, function(progress) {
 // To do: give progress feedback to user
 });
 
 Space3D.prototype._addLight = function(light) {
 };
 Space3D.prototype._addObject = function(object) {
 };
 Space3D.prototype._followObject = function(object) {
 };
 Space3D.prototype._hideAxes = function() {
 };
 Space3D.prototype._hideFPS = function() {
 };
 //Space3D.prototype._moveCameraBackward = function(0) {};
 //Space3D.prototype._moveCameraDown = function(0) {};
 //Space3D.prototype._moveCameraForward = function(0) {};
 //Space3D.prototype._moveCameraLeft = function(0) {};
 //Space3D.prototype._moveCameraRight = function(0) {};
 //Space3D.prototype._moveCameraUp = function(0) {};
 Space3D.prototype._removeLight = function(light) {
 };
 Space3D.prototype._removeObject = function(object) {
 };
 //Space3D.prototype._rotateCamera = function(0) {};
 //Space3D.prototype._setCameraAngle = function(0) {};
 //Space3D.prototype._setCameraPosition = function(0,0,0) {};
 Space3D.prototype._setCameraPosition2 = function(point) {
 };
 Space3D.prototype._showAxes = function() {
 };
 Space3D.prototype._showFPS = function() {
 };
 Space3D.prototype._start = function() {
 };
 Space3D.prototype._stop = function() {
 };
 Space3D.prototype._stopFollowObject = function() {
 };
 Space3D.prototype._translateCamera = function(x, y, z) {
 };
 
 
 //this.freeze(false);
 window.addEventListener("resize", function() {
 engine.resize();
 });
 };
 
 //    var scene = new BABYLON.Scene(engine);
 
 //    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
 //    camera.setTarget(BABYLON.Vector3.Zero());
 //    
 //    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
 //    light.intensity = 0.7;
 //
 //    var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene, true);
 
 Space3D.prototype = Object.create(TObject.prototype);
 Space3D.prototype.constructor = Space3D;
 Space3D.prototype.className = "Space3D";
 
 Space3D.prototype.addObject = function(obj3D) {
 obj3D.setSpace(scene);
 };
 
 Space3D.prototype.addLight = function(lg3D) {
 };
 
 Space3D.prototype.freeze = function(value) {
 if (value)
 camera.detachControl(canvas);
 else
 camera.attachControl(canvas, true);
 };
 
 TEnvironment.internationalize(Space3D, true);
 
 return Space3D;
 });
 
 */
