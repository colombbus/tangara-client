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
    var message = "";
    var scoreLimit = 0;
    var score = 0;
    
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
     * Check if the code matches with the regexp
     * /!\ to verify "o = new O()", don't forget the \ before parenthesis
     * /!\ abort the syntax verification of the code 
     * @param {String} value
     * @returns {Boolean} Returns true if the code matches with the regexp, else false.
     */
    Teacher.prototype.verifyRegexp = function(value) {
        var re = new RegExp(value);
        return re.test(statements);
    };
    
    /**
     * @param {string} value
     */
    Teacher.prototype.setMessage = function(value) {
        message = value;
    };
    
    /**
     * @returns {string} message
     */
    function getMessage() {
        if(typeof message === "undefined") {
            message = "Message indéfini.";
        }
        return message;
    };
    
    Teacher.prototype.getMessage = function() {
        return getMessage();
    };
    
    Teacher.prototype.setScore = function(value) {
        if(-1e-10 < value && value < 1 + 1e-10) {
            score = value;
        }
        else {
            //display the problem, a bit dirty
            message = "Score must be between 0 and 1.";
            window.console.log(message);
        }
    };
    
    Teacher.prototype.getScore = function() {
        return score;
    };
    
    /**
     * Validate the current step if "frame" is true
     * @param {String} message
     */
    function validateStep(message) {
        if (frame) {
            frame.validateStep(message);
        }
    };
    
    Teacher.prototype.validateStep = function(message) {
        validateStep(message);
    };

    /**
     * Invalidate the current step if "frame" is true. Send a message.
     * @param {String} message
     */
    function invalidateStep(message) {
        if (frame) {
            frame.invalidateStep(message);
        }
    };
    
    Teacher.prototype.invalidateStep = function(message) {
        invalidateStep(message);
    };
    
    /**
     * Set the score needed to validate
     * @param {number} value
     */
    Teacher.prototype.scoreToValidate = function(value) {
        scoreLimit = value;
    };
    
    /**
     * Check if the current score is sufficiently high to validate the task
     * @returns {Boolean}
     */
    function taskValidated() {
        return score > scoreLimit + 1e-10;
    };
    
    Teacher.prototype.taskValidated = function() {
        return taskValidated();
    };
    
    /**
     * Validate or invalidate the task
     */
    Teacher.prototype.done = function() {
        if (taskValidated()) {
            validateStep(getMessage());
        }
        else {
            invalidateStep(getMessage());
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
    
    /**
     * Checks if two numbers have the same value.
     * @param {Number} x
     * @param {Number} y
     * @returns {Boolean}
     */
    Teacher.prototype.equalNumbers = function(x, y) {
        if (Math.abs(x - y) < 0.0000000001) {
            return true;
        }
        return false;
    };
    
    var teacherInstance = new Teacher();

    return teacherInstance;
});



