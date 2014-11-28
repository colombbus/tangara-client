define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Box3D
     */
    var Box3D = function() {

    };

    Box3D.prototype = Object.create(TObject3D.prototype);
    Box3D.prototype.constructor = TObject3D;
    Box3D.prototype.className = "Box3D";

    Box3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        //scene = scene3d;
        //object3d = BABYLON.Mesh.CreateBox("box1", 2, scene);
        //object3d.position.y = 1;
    };

    Box3D.prototype._setBackColor = function(color, transparency) {
    };
    Box3D.prototype._setBackTexture = function(texture, repeatX, repeatY) {
    };
    Box3D.prototype._setBottomColor = function(color) {
    };
    Box3D.prototype._setBottomColor2 = function(color) {
    };
    Box3D.prototype._setBottomTexture = function(texture, repeatX, repeatY) {
    };
    Box3D.prototype._setColors = function(c1, c2, c3, c4, c5, c6, transparency) {
    };
    Box3D.prototype._setDimensions = function(x, y, z) {
    };
    Box3D.prototype._setFrontColor = function(color, transparency) {
    };
    Box3D.prototype._setFrontTexture = function(texture, repeatX, repeatY) {
    };
    Box3D.prototype._setLeftColor = function(color, transparency) {
    };
    Box3D.prototype._setLeftTexture = function(texture, repeatX, repeatY) {
    };
    Box3D.prototype._setRightColor = function(color, transparency) {
    };
    Box3D.prototype._setRightTexture = function(texture, repeatX, repeatY) {
    };
    Box3D.prototype._setTextures = function(t1, t2, t3, t4, t5, t6, repeatX, repeatY) {
    };
    Box3D.prototype._setTopColor = function(color, transparency) {
    };
    Box3D.prototype._setTopTexture = function(texture, repeatX, repeatY) {
    };

    TEnvironment.internationalize(Box3D, true);

    return Box3D;
});

