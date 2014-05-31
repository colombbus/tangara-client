define(['jquery', 'TError', 'quintus'], function($, TError, Quintus) {
    function TRuntime() {
        var libs = new Array();
        var translatedNames = new Array();
        var runtimeFrame;
        var runtimeCallback;
        var quintusInstance;
        var canvas;
        var log;
        var tObjects = new Array();
        var tGraphicalObjects = new Array();
        var currentProgramName;
        
        var designMode = false;
        var frozen = false;
        
        this.load = function(language, objectListUrl) {
            // create runtime frame
            this.initRuntimeFrame();
            
            // create quintusInstance;
            quintusInstance = Quintus().include("Sprites, Scenes, 2D, UI, Anim, Input, Touch");

            // find objects and translate them
            window.console.log("accessing objects list from: "+objectListUrl);
            $.ajax({
                dataType: "json",
                url: objectListUrl,
                async: false,
                success: function(data) {
                    $.each( data, function( key, val ) {
                        var lib = "objects/"+val['path']+"/"+key;
                        if (typeof val['translations'][language] !== 'undefined') {
                            window.console.log("adding "+lib);
                            libs.push(lib);
                            translatedNames.push(val['translations'][language]);
                        }
                    });
                }
            });
            
            // declare global variables
            require(libs, function() {
                for(var i= 0; i < translatedNames.length; i++) {
                    window.console.log("Declaring translated object '"+translatedNames[i]+"'");
                    runtimeFrame[translatedNames[i]] = arguments[i];
                }
            });
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
            var name;
            $.each(runtimeFrame, function(key, value) {
                if (value === reference) {
                    name = key;
                    return false;
                }
            });
            return name;
        };

        this.execute = function(commands, parameter, logCommands, lineNumbers) {
            if (typeof logCommands === 'undefined') {
                logCommands = true;
            }
            try {
                if (typeof commands === 'string' || commands instanceof String) {
                    runtimeFrame.eval(commands);
                } else if ((typeof commands === 'function' || commands instanceof Function) && (typeof runtimeFame[commands] === 'function' || runtimeFame[commands] instanceof Function)) {
                    //TODO : does not work... to be fixed!
                    runtimeFame[commands].call(runtimeFrame, parameter);
                }
                if (logCommands) {
                    this.logCommand(commands);
                }
            } catch (e) {
                var error = new TError(e);
                error.setCode(commands);
                error.setProgramName(currentProgramName);
                if (typeof lineNumbers !== null) {
                    error.setLines(lineNumbers);
                }
                this.logError(error);
                return false;
            }
            return true;
        };
        
        this.executeStatements = function(statements) {
            for (var i = 0; i<statements.length; i++) {
                var statement = statements[i];
                if (!this.execute(statement.body, null, true, [statement.loc.start.line,statement.loc.end.line]))
                    return false;
            }
        };
        
        this.executeFrom = function(object) {
            try {
                var statements = object.getStatements();
                this.executeStatements(statements);
            } catch (e) {
                var error = new TError(e);
                error.setProgramName(currentProgramName);
                if (currentProgramName === null) {
                    error.setCode(object.getValue());
                }
                this.logError(error);
            }
        };
        
        this.setQuintusInstance = function(instance) {
            quintusInstance = instance;
        };

        this.getQuintusInstance = function() {
            return quintusInstance;
        };

        this.setCanvas = function(element) {
            canvas = element;
        };
        
        this.setLog = function(element) {
            log = element;
        };
        
        this.logCommand = function(command) {
            if (typeof log !== 'undefined') {
                log.addCommand(command);
            }
        };
        
        this.logError = function(error) {
            if (typeof log !== 'undefined') {
                log.addError(error);
            }
        };

        this.stop = function() {
            if (quintusInstance.loop) {
                quintusInstance.pauseGame();
            }
            this.freeze(true);
        };

        this.start = function() {
            if (!quintusInstance.loop) {
                quintusInstance.unpauseGame();
            }
            this.freeze(false);
        };

        this.addObject = function(object) {
            window.console.log("adding object "+object);
            tObjects.push(object);
            // initialize object with current state
            object.freeze(frozen);
        };

        this.removeObject = function(object) {
            var index = tGraphicalObjects.indexOf(object);
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
            window.console.log("adding graphical object "+object);
            canvas.addGraphicalObject(object);
            tGraphicalObjects.push(object);
            // initialize object with current state
            object.freeze(frozen);
            object.setDesignMode(designMode);
        };
        
        this.removeGraphicalObject = function(object) {
            var index = tGraphicalObjects.indexOf(object);
            if (index > -1) {
                canvas.removeGraphicalObject(object);
                tGraphicalObjects.splice(index, 1);
                $.each(runtimeFrame, function(key, value) {
                    if (value === object) {
                        delete runtimeFrame[key];
                        return false;
                    }
                });
            }
        };

        this.clear = function() {
            // TODO: clear RuntimeFrame as well (e.g. to erase declared functions)
            while (tGraphicalObjects.length>0) {
                var object = tGraphicalObjects.pop();
                window.console.log("deleting graphical object "+object);
                object.deleteObject();
            }
            while (tObjects.length>0) {
                var object = tObjects.pop();
                window.console.log("deleting object "+object);
                object.deleteObject();
            }
        };

        this.setDesignMode = function(value) {
            // TODO: handle duplicate objects
            for (var i = 0; i<tGraphicalObjects.length; i++) {
                tGraphicalObjects[i].setDesignMode(value);
            }
            designMode = value;
        };
        
        this.freeze = function(value) {
            window.console.log("freezing graphical objects");
            for (var i = 0; i<tGraphicalObjects.length; i++) {
                tGraphicalObjects[i].freeze(value);
            }
            window.console.log("freezing objects");
            for (var i = 0; i<tObjects.length; i++) {
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
    };
    
    var runtimeInstance = new TRuntime();
    
    return runtimeInstance;
});


