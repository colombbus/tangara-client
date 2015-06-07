define(['TRuntime'], function(TRuntime) {
    var ResourceManager = function() {
        this.resources = {};
        this.transparent = false;
        this.transparentColors = [];
    };
    
    var qInstance = TRuntime.getQuintusInstance();    
    ResourceManager.STATE_LOADING = 0;
    ResourceManager.STATE_COMPUTING = 1;
    ResourceManager.STATE_READY = 2;
    
    
    getNewResource = function(state, resource, update) {
        if (typeof state === "undefined") {
            state = ResourceManager.STATE_LOADING;
        }
        if (typeof resource === 'undefined') {
            resource = {};
        }
        if (typeof update === 'undefined') {
            update = false;
        }
        return {state:state, resource:resource, update:update};
    };
    
    colorMatch = function (color, red, green, blue) {
        if (Math.abs(color[0] + color[1] + color[2] - red - green - blue) < 30)
            return true;
        return false;
    };  
    
    ResourceManager.prototype.add = function(name, asset, callback) {
        if (typeof this.resources[name] !== 'undefined') {
            // resource already added: call callback right now
            if (typeof callback !== 'undefined') {
                callback.call(this);
            }
        }
        this.resources[name] = getNewResource();
        
        var manager = this;
        qInstance.load(asset, function () {
            manager.resources[name]['resource'] = qInstance.asset(asset);
            if (manager.transparent) {
                manager.addTransparency(name, callback);
            } else {
                manager.resources[name]['state'] = ResourceManager.STATE_READY;
                if (typeof callback !== 'undefined') {
                    callback.call(manager);
                }
            }
        });
        return true;
     };
     
     ResourceManager.prototype.addTransparentColor = function(color, callbacks) {
        if (typeof callbacks === 'undefined') {
            callbacks = {};
        }
        this.transparentColors.push(color);
        this.transparent = true;
        for (var name in this.resources) {
            if (this.resources.hasOwnProperty(name)) {
                if (this.resources[name]['state'] === ResourceManager.STATE_READY) {
                    
                    // add transparency only if image already loaded
                   if (typeof callbacks[name] !== 'undefined') {
                       this.addTransparency(name, callbacks[name]);
                   } else {
                       this.addTransparency(name);
                   }
                } else {
                    // update will be required when loading complete
                    this.resources[name]['update'] = true;
                }

            }
        }
     };
     
     ResourceManager.prototype.addTransparency = function(name, callback) {
        this.resources[name]['state'] = ResourceManager.STATE_COMPUTING;
        this.resources[name]['update'] = false;
        var oldImage = this.resources[name]['resource'];
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var width = oldImage.width;
        var height = oldImage.height;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(oldImage, 0, 0);
        var imageData = ctx.getImageData(0, 0, width, height);
        var data = imageData.data;
        var color;
        for (var i = 0; i < data.length; i += 4) {
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];
            for (var j = 0; j < this.transparentColors.length; j++) {
                color = this.transparentColors[j];
                if (colorMatch(color, r, g, b)) {
                    data[i + 3] = 0;
                    break;
                }
            }
        }
        imageData.data = data;
        ctx.putImageData(imageData, 0, 0);
        var newImage = new Image();
        var manager = this;
        newImage.onload = function () {
            if (manager.resources[name]['update']) {
                // update required: add transparency again
                manager.resources[name]['update'] = false;
                manager.addTransparency(name, callback);
            } else {
                manager.resources[name]['resource'] = newImage;
                manager.resources[name]['state'] = ResourceManager.STATE_READY;
                if (typeof callback !== 'undefined') {
                    callback.call(manager);
                }
            }
        };
        // start loading
        newImage.src = canvas.toDataURL();
     };
     
     ResourceManager.prototype.getState = function(name) {
        if (typeof this.resources[name] === 'undefined') {
            return false;
        }
        return this.resources[name]['state'];
     };

    ResourceManager.prototype.ready = function(name) {
        if (typeof this.resources[name] === 'undefined') {
            return false;
        }
        return (this.resources[name]['state'] === ResourceManager.STATE_READY);
     };

    
     ResourceManager.prototype.get = function(name) {
        if (typeof this.resources[name] === 'undefined') {
            return false;
        }
        if (this.resources[name]['state'] !== ResourceManager.STATE_READY) {
            return false;
        }
        return this.resources[name]['resource'];
     };
     
     ResourceManager.prototype.getUnchecked = function(name) {
        if (typeof this.resources[name] === 'undefined') {
            return false;
        }
        if (this.resources[name]['state'] !== ResourceManager.STATE_READY) {
            return false;
        }
        return this.resources[name]['resource'];
     };     
     
     ResourceManager.prototype.remove = function(name) {
        if (typeof this.resources[name] === 'undefined') {
            return false;
        }
        delete this.resources[name];
     };

    ResourceManager.prototype.has = function(name) {
        return (typeof this.resources[name] !== 'undefined');        
     };

    
    return ResourceManager;
});

