define(['jquery', 'TError', 'quintus', 'TParser', 'TEnvironment', 'TInterpreter', 'TUtils'], function($, TError, Quintus, TParser, TEnvironment, TInterpreter, TUtils) {
    function TRuntime() {
        var libs = new Array();
        var translatedNames = new Array();
        var runtimeFrame;
        var interpreter = new TInterpreter();
        var runtimeCallback;
        var quintusInstance;
        var canvas;
        var log;
        var tObjects = new Array();
        var tGraphicalObjects = new Array();
        var currentProgramName;

        var designMode = false;
        var frozen = false;
        var wasFrozen = false;
        var Q = Quintus();

        this.load = function(language, objectListUrl) {
            // create runtime frame
            this.initRuntimeFrame();

            // create quintusInstance;
            quintusInstance = Q.include("Sprites, Scenes, 2D, UI, Anim, Input, Touch");
            this.tweakQuintus();

            // declare global variables
            var libs = TEnvironment.getObjectLibraries();
            var translatedNames = TEnvironment.getTranslatedObjectNames();
            var self = this;
            require(libs, function() {
                for(var i= 0; i < translatedNames.length; i++) {
                    window.console.log("Declaring translated object '"+translatedNames[i]+"'");
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

        this.execute = function(commands, parameter, logCommands, lineNumbers) {
            // TODO: detect function calls
            this.executeStatements(commands);
            
            
            
            
            
            
            // TO BE CONTINUED
            /*if (typeof logCommands === 'undefined') {
                logCommands = true;
            }
            try {
                if (typeof commands === 'string' || commands instanceof String) {
                    runtimeFrame.eval(commands);
                } else if (typeof commands === 'function' || commands instanceof Function) {
                    // TOTO: see if we need to check if function is actually declared in runtimeFrame
                    commands.call(runtimeFrame, parameter);
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
                error.detectError();
                this.logError(error);
                return false;
            }
            return true;*/
        };
        
        this.executeStatements = function(statements) {
            var i = -1;
            var runtime = this;
            function evalNextStatement() {
                i++;
                if (i<statements.length) {
                    interpreter.evalStatement(statements[i], function() {
                        runtime.logCommand(statements[i].raw);
                        evalNextStatement.call(runtime);
                    });
                }
            }
            evalNextStatement();
        };

        this.executeFrom = function(object) {
            try {
                var statements = object.getStatements();
                this.executeStatements(statements);
            } catch (err) {
                if (!(err instanceof TError)) {
                    var error = new TError(err);
                    error.setProgramName(currentProgramName);
                    if (currentProgramName === null) {
                        error.setCode(object.getValue());
                    }
                    error.detectError();
                    this.logError(error);
                } else {
                    err.setProgramName(currentProgramName);
                    if (currentProgramName === null) {
                        err.setCode(object.getValue());
                    }                    
                    this.logError(err);
                }
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
            wasFrozen = frozen;
            this.freeze(true);
        };

        this.start = function() {
            if (!quintusInstance.loop) {
                quintusInstance.unpauseGame();
            }
            if (!wasFrozen) {
                this.freeze(false);
            }
        };
        
        this.suspend = function() {
            interpreter.suspend();
        };
        
        this.resume = function() {
            interpreter.resume();
        }

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
                var object = tGraphicalObjects[0];
                // deleteObject will remove object from tGraphicalObjects
                object.deleteObject();
            }
            while (tObjects.length>0) {
                var object = tObjects[0];
                // deleteObject will remove object from tGraphicalObjects
                object.deleteObject();
            }
            interpreter.clear();
        };

        this.setDesignMode = function(value) {
            // TODO: handle duplicate objects
            for (var i = 0; i<tGraphicalObjects.length; i++) {
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
            
            for (var i = 0; i<tGraphicalObjects.length; i++) {
                tGraphicalObjects[i].freeze(value);
            }
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

        this.tweakQuintus = function() {


            // Tweak Quintus to be able to look for sprites while skipping some of them
            Q._TdetectSkip = function(obj, iterator, context, arg1, arg2, skip) {
                var result;
                if (obj == null) {
                    return;
                }
                if (obj.length === +obj.length) {
                    for (var i = 0, l = obj.length; i < l; i++) {
                        result = iterator.call(context, obj[i], i, arg1, arg2);
                        if (result) {
                            skip--;
                            if (skip < 0) {
                                return result;
                            }
                        }
                    }
                    return false;
                } else {
                    for (var key in obj) {
                        result = iterator.call(context, obj[key], key, arg1, arg2);
                        if (result) {
                            skip--;
                            if (skip < 0) {
                                return result;
                            }
                        }
                    }
                    return false;
                }
            };

            quintusInstance.Stage.prototype._TgridCellCheckSkip = function(type, id, obj, collisionMask, skip) {
                if (Q._isUndefined(collisionMask) || collisionMask & type) {
                    var obj2 = this.index[id];
                    if (obj2 && obj2 !== obj && Q.overlap(obj, obj2)) {
                        var col = Q.collision(obj, obj2);
                        if (col) {
                            col.obj = obj2;
                            return col;
                        } else {
                            return false;
                        }
                    }
                }
            };
            

            quintusInstance.Stage.prototype.TsearchSkip = function(obj, collisionMask, skip) {
                var col;

                // If the object doesn't have a grid, regrid it
                // so we know where to search
                // and skip adding it to the grid only if it's not on this stage
                if (!obj.grid) {
                    this.regrid(obj, obj.stage !== this);
                }

                var grid = obj.grid, gridCell, col;
                if (typeof skip === 'undefined') {
                    skip = 0;
                }

                for (var y = grid.Y1; y <= grid.Y2; y++) {
                    if (this.grid[y]) {
                        for (var x = grid.X1; x <= grid.X2; x++) {
                            gridCell = this.grid[y][x];
                            if (gridCell) {
                                col = Q._TdetectSkip(gridCell, this._TgridCellCheckSkip, this, obj, collisionMask, skip);
                                if (col) {
                                    return col;
                                }
                            }
                        }
                    }
                }
                return false;
            };


            // Tweak Quintus to be able to look for sprite with highest id
            Q.touchStage = [0];
            Q.touchType = 0;

            Q._TdetectTouch = function(obj, iterator, context, arg1, arg2) {
                var result = false, id = -1, col;
                if (obj == null) {
                    return;
                }
                
                if (obj.length === +obj.length) {
                    for (var i = 0, l = obj.length; i < l; i++) {
                        col = iterator.call(context, obj[i], i, arg1, arg2, id);
                        if (col) {
                            id = col.obj.p.id;
                            result = col;
                        }
                    }
                    return result;
                } else {
                    for (var key in obj) {
                        col = iterator.call(context, obj[key], key, arg1, arg2, id);
                        if (col) {
                            id = col.obj.p.id;
                            result = col;
                        }
                    }
                    return result;
                }
            };

            quintusInstance.Stage.prototype._TgridCellCheckTouch = function(type, id, obj, collisionMask, minId) {
                if (Q._isUndefined(collisionMask) || collisionMask & type) {
                    var obj2 = this.index[id];
                    if (obj2 && obj2 !== obj && !obj2.p.hidden && obj2.p.id > minId && Q.overlap(obj, obj2)) {
                        var col = Q.collision(obj, obj2);
                        if (col) {
                            col.obj = obj2;
                            return col;
                        } else {
                            return false;
                        }
                    }
                }
            };


            quintusInstance.Stage.prototype.TsearchTouch = function(obj, collisionMask) {
                var col;

                // If the object doesn't have a grid, regrid it
                // so we know where to search
                // and skip adding it to the grid only if it's not on this stage
                if (!obj.grid) {
                    this.regrid(obj, obj.stage !== this);
                }

                var grid = obj.grid, gridCell, col;
                
                for (var y = grid.Y1; y <= grid.Y2; y++) {
                    if (this.grid[y]) {
                        for (var x = grid.X1; x <= grid.X2; x++) {
                            gridCell = this.grid[y][x];
                            if (gridCell) {
                                col = Q._TdetectTouch(gridCell, this._TgridCellCheckTouch, this, obj, collisionMask);
                                if (col) {
                                    return col;
                                }
                            }
                        }
                    }
                }
                return false;
            };


            Q.TouchSystem.prototype.touch = function(e) {
                var touches = e.changedTouches || [e];

                for (var i = 0; i < touches.length; i++) {

                    for (var stageIdx = 0; stageIdx < Q.touchStage.length; stageIdx++) {
                        var touch = touches[i],
                                stage = Q.stage(Q.touchStage[stageIdx]);

                        if (!stage) {
                            continue;
                        }

                        touch.identifier = touch.identifier || 0;
                        var pos = this.normalizeTouch(touch, stage);

                        stage.regrid(pos, true);
                        var col = stage.TsearchTouch(pos, Q.touchType), obj;

                        if (col || stageIdx === Q.touchStage.length - 1) {
                            obj = col && col.obj;
                            pos.obj = obj;
                            this.trigger("touch", pos);
                        }

                        if (obj && !this.touchedObjects[obj]) {
                            this.activeTouches[touch.identifier] = {
                                x: pos.p.px,
                                y: pos.p.py,
                                origX: obj.p.x,
                                origY: obj.p.y,
                                sx: pos.p.ox,
                                sy: pos.p.oy,
                                identifier: touch.identifier,
                                obj: obj,
                                stage: stage
                            };
                            this.touchedObjects[obj.p.id] = true;
                            obj.trigger('touch', this.activeTouches[touch.identifier]);
                            break;
                        }

                    }

                }
                //e.preventDefault();
            };

            Q.touch = function(type, stage) {
                Q.untouch();
                Q.touchType = type || Q.SPRITE_UI;
                Q.touchStage = stage || [2, 1, 0];
                if (!Q._isArray(Q.touchStage)) {
                    touchStage = [Q.touchStage];
                }

                if (!Q._touch) {
                    Q.touchInput = new Q.TouchSystem();
                }
                return Q;
            };



        };

    };




    var runtimeInstance = new TRuntime();

    return runtimeInstance;
});


