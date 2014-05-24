define(['jquery', 'quintus'], function($, Quintus) {
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

        this.execute = function(commands, parameter, lineNumbers) {
            var error = false;
            var message;
            try {
                    if (typeof commands === 'string' || commands instanceof String) {
                        runtimeFrame.eval(commands);
                    } else if ((typeof commands === 'function' || commands instanceof Function) && (typeof runtimeFame[commands] === 'function' || runtimeFame[commands] instanceof Function)) {
                        runtimeFame[commands].call(runtimeFrame, parameter);
                    }
                
            } catch (e) {
                // TODO: real error management
                error = true;
                message = e.message;
                if (typeof lineNumbers !== 'undefined') {
                    if (lineNumbers[0]===lineNumbers[1]) {
                        message += " (ligne : "+lineNumbers[0]+")";
                    } else {
                        message += " (lignes "+lineNumbers[0]+" à "+lineNumbers[1]+")";
                    }
                }
            }
            if (error)
                this.addLog(commands, message);
            else
                this.addLog(commands);
            return !error;
        };
        
        this.executeStatements = function(statements) {
            for (var i = 0; i<statements.length; i++) {
                var statement = statements[i];
                if (!this.execute(statement.body, null, [statement.loc.start.line,statement.loc.end.line] ))
                    return false;
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
        
        this.addLog = function(text, success) {
            if (typeof log !== 'undefined') {
                log.addLines(text, success);
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
        
        
    };
    
    var runtimeInstance = new TRuntime();
    
    return runtimeInstance;
});


