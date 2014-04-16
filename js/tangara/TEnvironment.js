define(['jquery','TRuntime', 'quintus'], function($, TRuntime, Quintus) {
    var TEnvironment = function() {
        var canvas;
        var log;
        var runtimeFrame;
        var runtimeCallback;
        var quintusInstance;
        var translated = new Array();
        
        this.messages;
        
        // TODO: change this
        this.language = "fr";
        
        this.load = function() {
            window.console.log("*** Loading Tangara Environment ***");
            window.console.log("* Retrieving translated messages");
            var messageFile = this.getResource("messages.json");
            window.console.log("getting messages from: " + messageFile);
            var language = this.language;
            var parent = this;
            $.ajax({
                dataType: "json",
                url: messageFile,
                async: false,
                success: function(data) {
                    if (typeof data[language] !== 'undefined'){
                        parent.messages = data[language];
                        window.console.log("found messages in language: "+language);
                    } else {
                        window.console.log("found no messages for language: "+language);
                    }
                }
            });
            this.loadGraphics();
            this.loadRuntime();
        };
        
        this.loadGraphics = function() {
            window.console.log("* Loading Graphics");
            quintusInstance = Quintus().include("Sprites, Scenes, 2D, UI, Anim, Input, Touch");
            // Debug : 
            //quintusInstance.debug = true;
            //quintusInstance.debugFill = true;
        };
        
        this.loadRuntime = function() {
            window.console.log("* Loading Runtime");
            TRuntime.load();
        };

        this.setCanvas = function(element) {
            canvas = element;
            return;
        };

        this.setLog = function(element) {
            log = element;
            return;
        };


        this.getCanvas = function() {
            return canvas;
        };
        
        this.execute = function(command, parameter) {
            TRuntime.execute(command, parameter);
        };
        
        this.addLog = function(text, success) {
            if (typeof log !== 'undefined') {
                log.addLines(text, success);
            }
        };
        
        this.addLogMessage = function(text) {
            if (typeof log !== 'undefined') {
                log.addMessage(text);
            }            
        };
        
        this.clearLog = function() {
            if (typeof log !== 'undefined') {
                log.clear();
            }
        };
        
        this.getBaseUrl = function() {
            return window.location.protocol + "//" + window.location.host+ window.location.pathname.split("/").slice(0, -1).join("/");
        };
        
        this.getObjectsUrl = function() {
            return this.getBaseUrl()+"/js/tangara/objects";
        };
        
        this.getLanguage = function() {
            return this.language;
        };
        
        this.setLanguage = function(language) {
            this.language = language;
        };
        
        var addTranslatedMethod = function(aClass, name, translated) {
            aClass.prototype[translated] = aClass.prototype[name];
            //TODO: find a working way to prevent classes from being modified 
            // Object.freeze(initialClass.prototype); // TOO STRICT
            Object.defineProperty(aClass, translated,  {
              enumerable: false,
              configurable: false,
              writable: false}); // DOES NOT WORK
        };
        
        var addTranslatedMethods = function(aClass, file, language) {
            if (typeof translated[file] !== "undefined") {
                // translation already loaded: we use it
                $.each(translated[file], function(name, translated) {
                    addTranslatedMethod(aClass,name, translated);
                });
            }
            $.ajax({
                dataType: "json",
                url: file,
                async: false,
                success: function(data) {
                    translated[file] = new Array();
                    window.console.log("traduction : "+file);
                    window.console.log("Language : "+language);
                    $.each(data[language]['methods'], function(key, val ) {
                        addTranslatedMethod(aClass,val['name'], val['translated']);
                        translated[file][val['name']] = val['translated'];
                    });
                },
                error: function(data, status, error) {
                    window.console.log("Error loading translated methods ("+file+"): "+status);
                }
            });
        };
        
        this.internationalize = function(initialClass, parents) {
            var translationFile = initialClass.prototype.getResource("i18n.json");
            addTranslatedMethods(initialClass, translationFile, this.language);
            if ((typeof parents !== 'undefined')&&parents) {
                // internationalize parents as well
                var parentClass = Object.getPrototypeOf(initialClass.prototype);
                while (parentClass !== Object.prototype) {
                    translationFile = parentClass.getResource("i18n.json");
                    addTranslatedMethods(initialClass, translationFile, this.language);
                    parentClass = Object.getPrototypeOf(parentClass);
                }
            }
            return initialClass;
        };
        
        this.getResource = function(location) {
            return this.getBaseUrl()+"/js/tangara/resources/"+location;
        };

        this.getUserResource = function(location) {
            // TODO: to be replaced with user directory management
            return this.getBaseUrl()+"/tests/"+location;
        };

        this.getMessage = function(code) {
            if (typeof this.messages[code] !== 'undefined') {
                return this.messages[code];
            } else {
                return code;
            }
        };
        
        this.initRuntimeFrame = function() {
            if (typeof runtimeFrame === 'undefined') {
                window.bindSandbox = function(callback) {
                    require(['TEnvironment'], function(TEnvironment) {
                        TEnvironment.setRuntimeCallback(callback);
                    });
                };
                var iframe = document.createElement("iframe");
                iframe.className = "runtime-frame";
                iframe.setAttribute("src", "sandbox.html");
                document.body.appendChild(iframe);
                runtimeFrame = iframe.contentWindow || iframe;
            }
            return runtimeFrame;
        };
        
        this.getRuntimeFrame = function() {
            return runtimeFrame;
        };
        
        this.setRuntimeCallback = function(callback) {
            runtimeCallback = callback;
            TRuntime.setCallback(callback);
        };
        
        this.getRuntimeCallback = function() {
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
        
        this.deleteTObject = function(reference) {
            $.each(runtimeFrame, function(key, value) {
                if (value === reference) {
                    delete runtimeFrame[key];
                    return false;
                }
            });
        };
        
        this.setQuintusInstance = function(instance) {
            quintusInstance = instance;
        };
        
        this.getQuintusInstance = function() {
            return quintusInstance;
        };

    };

    var environmentInstance = new TEnvironment();
    
    environmentInstance.load();

    return environmentInstance;
});


