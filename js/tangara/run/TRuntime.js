define(['jquery', 'TError', 'TGraphics', 'TParser', 'TEnvironment', 'TInterpreter', 'TUtils'], function($, TError, TGraphics, TParser, TEnvironment, TInterpreter, TUtils) {
    function TRuntime() {
        var libs = new Array();
        var translatedNames = new Array();
        var runtimeFrame;
        var interpreter = new TInterpreter();
        var runtimeCallback;
        var graphics;
        var log;
        var tObjects = new Array();
        var tGraphicalObjects = new Array();
        var currentProgramName;

        var designMode = false;
        var frozen = false;
        var wasFrozen = false;

        this.load = function(language, objectListUrl) {
            // create runtime frame
            this.initRuntimeFrame();

            // create graphics;
            graphics = new TGraphics();

            // declare global variables
            var libs = TEnvironment.getObjectLibraries();
            var translatedNames = TEnvironment.getTranslatedObjectNames();
            var self = this;
            require(libs, function() {
                for (var i = 0; i < translatedNames.length; i++) {
                    window.console.log("Declaring translated object '" + translatedNames[i] + "'");
                    runtimeFrame[translatedNames[i]] = arguments[i];
                }
                self.ready();
            });
            window.console.log("**** TRUNTIME INITIALIZED ****");
            // Ask parser to protect translated names
            TParser.protectIdentifiers(translatedNames);

            // link interpreter to runtimeFrame
            interpreter.setRuntimeFrame(runtimeFrame);
        };

        this.ready = function() {
            TEnvironment.runtimeReady();
        };

        this.initRuntimeFrame = function() {
            if (typeof runtimeFrame === 'undefined') {
                var runtime = this;
                var iframe = document.createElement("iframe");
                iframe.className = "runtime-frame";
                document.body.appendChild(iframe);
                runtimeFrame = iframe.contentWindow || iframe;
            }
        };

        this.getRuntimeFrame = function() {
            return runtimeFrame;
        };

        this.setCallback = function(callback) {
            runtimeCallback = callback;
        };

        this.getCallback = function() {
            return runtimeCallback;
        };

        this.getTObjectName = function(reference) {
            if (typeof reference.objectName !== 'undefined') {
                return reference.objectName;
            }
            var name;
            $.each(runtimeFrame, function(key, value) {
                if (value === reference) {
                    name = key;
                    return false;
                }
            });
            reference.objectName = name;
            return name;
        };

        this.getTObjectClassName = function(objectName) {
            if (typeof runtimeFrame[objectName] === 'undefined') {
                return false;
            }
            if (typeof runtimeFrame[objectName].className === 'undefined') {
                return false;
            }
            return runtimeFrame[objectName].className;
        };


        // COMMANDS EXECUTION

        this.handleError = function(err, value, lines) {
            var error;
            if (!(err instanceof TError)) {
                error = new TError(err);
                error.detectError();
            } else {
                error = err;
            }
            error.setProgramName(currentProgramName);
            if (currentProgramName === null) {
                error.setCode(value);
            }
            if (!lines) {
                error.setLines([]);
            }
            this.logError(error);
        };

        this.executeStatements = function(statements) {
            interpreter.addStatements(statements);
        };

        this.executeStatementsNow = function(statements, log) {
            interpreter.insertStatements(statements, log);
        };

        this.executeNow = function(commands, parameter, logCommands) {
            try {
                this.executeStatementsNow(commands, logCommands);
            } catch (error) {
                this.handleError(error, commands.raw, false);
            }
        };

        this.executeFrom = function(object) {
            try {
                var statements = object.getStatements();
                this.executeStatements(statements);
            } catch (error) {
                this.handleError(error, object.getValue(), true);
            }
        };

        this.getGraphics = function() {
            return graphics;
        };

        this.setLog = function(element) {
            log = element;
            interpreter.setLog(element);
        };

        this.logCommand = function(command) {
            if (typeof log !== 'undefined') {
                log.addCommand(command);
            }
        };

        this.logError = function(error) {
            if (typeof log !== 'undefined') {
                log.addError(error);
            } else {
                window.console.error(error);
            }
        };

        this.stop = function() {
            graphics.pause();
            wasFrozen = frozen;
            this.freeze(true);
        };

        this.start = function() {
            graphics.unpause();
            if (!wasFrozen) {
                this.freeze(false);
            }
        };

        this.suspend = function() {
            interpreter.suspend();
        };

        this.resume = function() {
            interpreter.resume();
        };

        this.addObject = function(object) {
            tObjects.push(object);
            // initialize object with current state
            object.freeze(frozen);
        };

        this.removeObject = function(object) {
            var index = tObjects.indexOf(object);
            if (index > -1) {
                tObjects.splice(index, 1);
                $.each(runtimeFrame, function(key, value) {
                    if (value === object) {
                        delete runtimeFrame[key];
                        return false;
                    }
                });
            }
        };

        this.addGraphicalObject = function(object) {
            graphics.insertObject(object.getGObject());
            tGraphicalObjects.push(object);
            // initialize object with current state
            object.freeze(frozen);
            object.setDesignMode(designMode);
        };

        this.removeGraphicalObject = function(object) {
            var index = tGraphicalObjects.indexOf(object);
            if (index > -1) {
                graphics.removeObject(object.getGObject());
                tGraphicalObjects.splice(index, 1);
                $.each(runtimeFrame, function(key, value) {
                    if (value === object) {
                        delete runtimeFrame[key];
                        return false;
                    }
                });
            }
        };

        this.clearGraphics = function() {
            while (tGraphicalObjects.length > 0) {
                var object = tGraphicalObjects[0];
                // deleteObject will remove object from tGraphicalObjects
                object.deleteObject();
            }
        };

        this.clear = function() {
            // TODO: clear RuntimeFrame as well (e.g. to erase declared functions)
            this.clearGraphics();
            while (tObjects.length > 0) {
                var object = tObjects[0];
                // deleteObject will remove object from tGraphicalObjects
                object.deleteObject();
            }
            interpreter.clear();
        };

        this.setDesignMode = function(value) {
            // TODO: handle duplicate objects
            for (var i = 0; i < tGraphicalObjects.length; i++) {
                tGraphicalObjects[i].setDesignMode(value);
            }
            designMode = value;
        };

        this.freeze = function(value) {
            if (value) {
                this.suspend();
            } else {
                this.resume();
            }

            for (var i = 0; i < tGraphicalObjects.length; i++) {
                tGraphicalObjects[i].freeze(value);
            }
            for (var i = 0; i < tObjects.length; i++) {
                tObjects[i].freeze(value);
            }
            frozen = value;
        };

        this.setCurrentProgramName = function(name) {
            currentProgramName = name;
        };

        this.getCurrentProgramName = function() {
            return currentProgramName;
        };

        // TODO: find the right place for this function
        this.preloadResources = function(project, callback, options) {
            graphics.preloadResources(project, callback, options);
        };

        this.getGraphics = function() {
            return graphics;
        };

    }

    var runtimeInstance = new TRuntime();

    return runtimeInstance;
});


