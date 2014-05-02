define(['jquery', 'TRuntime', 'TEnvironment'], function($, TRuntime, TEnvironment) {
    function TObject() {
        TRuntime.addObject(this);
    }

    TObject.prototype.className = "TObject";

    TObject.prototype.deleteObject = function() {
        TRuntime.removeObject(this);
    };

    TObject.prototype.getResource = function(location) {
        return TEnvironment.getObjectsUrl()+"/"+this.className.toLowerCase()+"/resources/"+location;
    };

    TObject.prototype.getMessage = function(code) {
        if (typeof this.constructor.messages[code] !== 'undefined') {
            return this.constructor.messages[code];
        } else {
            return code;
        }
    };
    
    TObject.prototype._delete = function() {
        this.deleteObject();
    };

    TObject.prototype.freeze = function(value) {
        // every object may add actions to take to freeze
    };
    
    TObject.prototype.toString = function() {
        return "TObject "+this.className;
    };
    
    return TObject;
});