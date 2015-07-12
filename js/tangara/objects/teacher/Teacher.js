define(['jquery', 'TEnvironment', 'TRuntime', 'TUtils', 'SynchronousManager', 'TObject', 'TLink'], function($, TEnvironment, TRuntime, TUtils, SynchronousManager, TObject, TLink) {
    var Teacher = function() {
        // Do not call parent constructor, as we don't want this object to be erased when clearing the
        // Runtime
        this.synchronousManager = new SynchronousManager();

    };

    Teacher.prototype = Object.create(TObject.prototype);
    Teacher.prototype.constructor = Teacher;
    Teacher.prototype.className = "Teacher";

    /*Tangara.prototype._write = function(value) {
     value = TUtils.getString(value);
     TUI.addLogMessage(value);
     };*/


    //Learn.countObject

    var statements = [];
    var frame = false;
    var values = {};

    Teacher.prototype.setStatements = function(value) {
        statements = value;
    };

    Teacher.prototype.dumpStatements = function(value) {
        console.debug(statements);
    };

    Teacher.prototype.setFrame = function(value) {
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

    Teacher.prototype.hasStatement = function(value) {
        for (var i = 0; i < statements.length; i++) {
            var statement = statements[i];
            if (check(statement, value)) {
                return true;
            }
        }
        return false;
    };

    Teacher.prototype.validateStep = function() {
        if (frame) {
            frame.validateStep();
        }
    };

    Teacher.prototype.invalidateStep = function(message) {
        if (frame) {
            frame.invalidateStep(message);
        }
    };

    Teacher.prototype.wait = function(delay) {
        this.synchronousManager.begin();
        var parent = this;
        window.setTimeout(function() {
            parent.synchronousManager.end();
        }, delay);
    };

    Teacher.prototype.set = function(name, value) {
        values[name] = value;
    };

    Teacher.prototype.get = function(name) {
        if (typeof values[name] !== 'undefined') {
            return values[name];
        } else {
            return false;
        }
    };

    Teacher.prototype.log = function(value) {
        console.log(value);
    };

    Teacher.prototype.debug = function(value) {
        console.debug(value);
    };

    TEnvironment.internationalize(Teacher);

    var teacherInstance = new Teacher();

    return teacherInstance;
});



