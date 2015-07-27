define(['jquery', 'TEnvironment', 'TRuntime', 'TUtils', 'SynchronousManager', 'TObject', 'TLink'], function($, TEnvironment, TRuntime, TUtils, SynchronousManager, TObject, TLink) {
    /**
     * Defines Teacher, inherited from TObject.
     * Teacher is an object used to validate routes.
     * It compare values with statements, and can (un)validate steps.
     * @exports Teacher
     */
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

    /**
     * Set the array of statements.
     * @param {String[]} value
     */
    Teacher.prototype.setStatements = function(value) {
        statements = value;
    };

    /**
     * Print Statements in debug.
     * @param {String} value
     */
    Teacher.prototype.dumpStatements = function(value) {
        console.debug(statements);
    };

    /**
     * Set frame to "value".
     * @param {Boolean} value
     */
    Teacher.prototype.setFrame = function(value) {
        frame = value;
    };

    /**
     * Compare the contents of "statement" and "value".
     * @param {String[]} statement
     * @param {String[]} value
     * @returns {Boolean}   Returns true if contents are equals, else false.
     */
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

    /**
     * Check if "value" is in the array "statement".
     * @param {String} value
     * @returns {Boolean} Returns true if value is in statement, else false.
     */
    Teacher.prototype.hasStatement = function(value) {
        for (var i = 0; i < statements.length; i++) {
            var statement = statements[i];
            if (check(statement, value)) {
                return true;
            }
        }
        return false;
    };

    /**
     * Validate the current step if "frame" is true.
     */
    Teacher.prototype.validateStep = function() {
        if (frame) {
            frame.validateStep();
        }
    };

    /**
     * Invalidate the current step if "frame" is true. Send a message.
     * @param {String} message
     */
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

    /**
     * Set value at values[name].
     * @param {String} name
     * @param {String} value
     */
    Teacher.prototype.set = function(name, value) {
        values[name] = value;
    };

    /**
     * Get the value of values[name].
     * @param {String} name
     * @returns {String|Boolean}    Returns values[name], or false if undefined.
     */
    Teacher.prototype.get = function(name) {
        if (typeof values[name] !== 'undefined') {
            return values[name];
        } else {
            return false;
        }
    };

    /**
     * Print value in log.
     * @param {String} value
     */
    Teacher.prototype.log = function(value) {
        console.log(value);
    };

    /**
     * Print value in debug.
     * @param {String} value
     */
    Teacher.prototype.debug = function(value) {
        console.debug(value);
    };

    var teacherInstance = new Teacher();

    return teacherInstance;
});



