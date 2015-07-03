define(['jquery', 'TEnvironment', 'TRuntime', 'utils/TUtils', 'utils/SynchronousManager', 'TObject', 'TLink'], function($, TEnvironment, TRuntime, TUtils, SynchronousManager, TObject, TLink) {
    var Learn = function() {
        // Do not call parent constructor, as we don't want this object to be erased when clearing the
        // Runtime
        this.synchronousManager = new SynchronousManager();
        
    };

    Learn.prototype = Object.create(TObject.prototype);
    Learn.prototype.constructor = Learn;
    Learn.prototype.className = "Learn";

    /*Tangara.prototype._write = function(value) {
        value = TUtils.getString(value);
        TUI.addLogMessage(value);
    };*/

    
    //Learn.countObject
    
    var statements = [];
    var frame = false;
    var values = {};
    
    Learn.prototype.setStatements = function(value) {
        statements = value;
    };

    Learn.prototype.dumpStatements = function(value) {
        console.debug(statements);
    };
    
    Learn.prototype.setFrame = function(value) {
        frame = value;
    };
    
    function check(statement, value) {
        for (var key in value) {
            if (typeof statement[key] === "undefined") {
                return false;
            }
            if (typeof value[key] === 'object') {
                if (typeof statement[key] === 'object') {
                    if (!check(statement[key], value[key])) {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                if (value[key] !== statement[key]) {
                    return false;
                }
            }
        }
        return true;
    }

    Learn.prototype.hasStatement = function(value) {
        for (var i=0; i<statements.length; i++) {
            var statement = statements[i];
            if (check(statement, value)) {
                return true;
            }
        }
        return false;
    };
    
    Learn.prototype.validateStep = function() {
        if (frame) {
            frame.validateStep();
        }
    };

    Learn.prototype.invalidateStep = function(message) {
        if (frame) {
            frame.invalidateStep(message);
        }
    };

    Learn.prototype.wait = function(delay) {
        this.synchronousManager.begin();
        var parent = this;
        window.setTimeout(function() {
            parent.synchronousManager.end();
        }, delay);
    };
    
    Learn.prototype.set = function(name, value) {
        values[name] = value;
    };
    
    Learn.prototype.get = function(name) {
        if (typeof values[name] !== 'undefined') {
            return values[name];
        } else {
            return false;
        }
    };
    
    Learn.prototype.log = function(value) {
        console.log(value);
    };

    Learn.prototype.debug = function(value) {
        console.debug(value);
    };

    TEnvironment.internationalize(Learn);

    var learnInstance = new Learn();

    return learnInstance;
});



