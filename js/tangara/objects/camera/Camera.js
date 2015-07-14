define(['jquery', 'TUtils', 'TRuntime', 'TObject'], function($, TUtils, TRuntime, TObject) {
    var Camera = function() {
    	this.activated = false;
    	this.followedObject = null;
    	this.followX = true;
    	this.followY = true;
    };
    
    Camera.prototype = Object.create(TObject.prototype);
    Camera.prototype.constructor = Camera;
    Camera.prototype.className = "Camera";

    var getStage = function() {
    	return TRuntime.getGraphics().getInstance().stage();
    };
    
    Camera.prototype.activate = function() {
    	if (!this.activated) {
    		var s = getStage();
        	s.add("viewport");
        	this.activated = true;
    	}
    };
    
    Camera.prototype.follow = function() {
    	this.activate();
    	var s = getStage();
    	s.follow(this.followedObject.getGObject(), {x:this.followX, y:this.followY});
    };
    
    Camera.prototype.stopFollow = function() {
    	if (this.activated) {
        	var s = getStage();
        	s.unfollow();
    	}
    };

    Camera.prototype._follow = function(object) {
    	object = TUtils.getObject(object);
    	this.followedObject = object;
    	this.follow();
    };

    Camera.prototype._unfollow = function() {
    	this.stopFollow();
    };
    
    Camera.prototype._followX = function(value) {
    	value = TUtils.getBoolean(value);
    	this.followX = value;
    	this.follow();
    };
    
    Camera.prototype._followY = function(value) {
    	value = TUtils.getBoolean(value);
    	this.followY = value;
    	this.follow();
    };
    
    Camera.prototype._moveTo = function(x,y) {
    	x = TUtils.getInteger(x);
    	y = TUtils.getInteger(y);
    	var s = getStage();
    	this.stopFollow();
    	s.moveTo(x,y);
    };

    Camera.prototype._centerOn = function(x,y) {
    	x = TUtils.getInteger(x);
    	y = TUtils.getInteger(y);
    	var s = getStage();
    	this.stopFollow();
    	s.centerOn(x,y);
    };
    
    var instance = new Camera();
    
    return instance;
});



