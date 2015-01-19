define(['jquery', 'TRuntime', 'TEnvironment'], function($, TRuntime, TEnvironment) {
    function TObject() {
        TRuntime.addObject(this);
    }

    TObject.prototype.objectName;
    TObject.prototype.className = "TObject";

    TObject.prototype.deleteObject = function() {
        TRuntime.removeObject(this);
    };

    TObject.prototype.getResource = function(location) {
        var objectPath = TEnvironment.getObjectPath(this.className);
        var path = this.className.toLowerCase();

        if (typeof objectPath !== 'undefined') {
            path = objectPath;
        }
        return TEnvironment.getObjectsUrl() + "/" + path + "/resources/" + location;
    };

    TObject.prototype.getMessage = function(code) {
        if (typeof this.constructor.messages[code] !== 'undefined') {
            var message = this.constructor.messages[code];
            if (arguments.length > 1) {
                // message has to be parsed
                var elements = arguments;
                message = message.replace(/{(\d+)}/g, function(match, number) {
                    number = parseInt(number) + 1;
                    return typeof elements[number] !== 'undefined' ? elements[number] : match;
                });
            }
            return message;
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
        return "TObject " + this.className;
    };

    return TObject;
});