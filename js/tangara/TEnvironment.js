define(['jquery'], function($) {
    var TEnvironment = function() {
        var processedFiles = {};
        var hiddenMethods = {};
        var classMethods = new Array();
        var objectLibraries = [];
        var objectsPath = [];
        var translatedObjectNames = [];
        var tangaraObjects = {};
        var project;
        var projectAvailable = false;
        var ready_frame = false;
        var ready_runtime = false;
        var ready_environment = false;
        var ready_callback = null;
        var support3D = null;
        
        this.messages = {};

        // TODO: change this
        this.language = "fr";

        // Config parameters: default values
        this.config = {"debug":false, "backend-path":"/tangara-ui/web/app.php/"};
        this.debug;

        this.load = function() {
            window.console.log("*** Loading Tangara Environment ***");
            window.console.log("* Loading config");
            var configFile = this.getResource("config.json");
            var parent = this;
            $.ajax({
                dataType: "json",
                url: configFile,
                async: false,
                success: function(data) {
                    $.extend(parent.config, data);
                    parent.debug = parent.config['debug'];
                }
            });
            window.console.log("* Retrieving translated messages");
            var messageFile = this.getResource("messages.json");
            window.console.log("getting messages from: " + messageFile);
            var language = this.language;
            $.ajax({
                dataType: "json",
                url: messageFile,
                async: false,
                success: function(data) {
                    if (typeof data[language] !== 'undefined') {
                        parent.messages = data[language];
                        window.console.log("found messages in language: " + language);
                    } else {
                        window.console.log("found no messages for language: " + language);
                    }
                }
            });
            window.console.log("* Retrieving list of translated objects");
            // find objects and translate them
            var objectListUrl = this.getObjectListUrl();
            var is3DSupported = this.is3DSupported();
            window.console.log("accessing objects list from: "+objectListUrl);
            $.ajax({
                dataType: "json",
                url: objectListUrl,
                async: false,
                success: function(data) {
                    $.each( data, function( key, val ) {
                        var addObject = true;
                        if (typeof val['conditions'] !== 'undefined') {
                            // object rely on conditions 
                            for (var i=0; i<val['conditions'].length; i++) {
                                var condition = val['conditions'][i];
                                switch (condition) {
                                    case '3d':
                                        if (!is3DSupported) {
                                            addObject = false;
                                        }
                                        break;
                                }
                            }
                        }
                        if (addObject) {
                            var lib = "objects/"+val['path']+"/"+key;
                            objectsPath[key] = val['path'];
                            if (typeof val['translations'][language] !== 'undefined') {
                                window.console.log("adding "+lib);
                                objectLibraries.push(lib);
                                var translatedName = val['translations'][language];
                                translatedObjectNames.push(translatedName);
                                tangaraObjects[translatedName] = key;
                            }
                        }
                    });
                }
            });
            this.ready();
        };
        

        this.getBaseUrl = function() {
            return window.location.protocol + "//" + window.location.host + window.location.pathname.split("/").slice(0, -1).join("/");
        };

        this.getObjectsUrl = function() {
            return this.getBaseUrl() + "/js/tangara/objects";
        };

        this.getObjectListUrl = function() {
            return this.getObjectsUrl() + "/objects.json";
        };
        this.getObjectPath = function(object) {
            if (object !== 'undefined')
                return objectsPath[object];
        };
        
        this.getBackendUrl = function(module) {
            var url = window.location.protocol + "//" + window.location.host + window.location.pathname.split("/").slice(0, -2).join("/");
            url += this.config['backend-path'] + "assets/";
            if (typeof module !== "undefined"){
                url = url + module;
            }
            return url;
        };

        this.getLanguage = function() {
            return this.language;
        };

        this.setLanguage = function(language) {
            this.language = language;
        };

        this.getObjectLibraries = function() {
            return objectLibraries;
        };

        this.getTranslatedObjectNames = function() {
            return translatedObjectNames;
        };

        var addTranslatedMethod = function(aClass, name, translated) {
            aClass.prototype[translated] = aClass.prototype[name];
            //TODO: find a working way to prevent classes from being modified 
            // Object.freeze(initialClass.prototype); // TOO STRICT
            Object.defineProperty(aClass, translated, {
                enumerable: false,
                configurable: false,
                writable: false}); // DOES NOT WORK
        };
        
        var hideTranslatedMethod = function (aClass, translated) {
            // redefine method to hide the orignal one
            aClass.prototype[translated] = function() {throw new Error("unknown function");};
        };

        var addTranslatedMethods = function(aClass, file, language, hideMethods) {
            if (typeof hideMethods === 'undefined') {
                hideMethods = [];
            }
            if (typeof processedFiles[file] !== "undefined") {
                hideMethods = hideMethods.concat(hiddenMethods[file]);
                // translation already loaded: we use it
                $.each(processedFiles[file], function(name, value) {
                    if (hideMethods.indexOf(name) == -1) {
                        addTranslatedMethod(aClass, name, value.translated);
                        classMethods[aClass.prototype.className][value.translated] = value.displayed;
                    } else {
                        hideTranslatedMethod(aClass, value.translated);
                    }
                });
            } else {
                // load translation file
                $.ajax({
                    dataType: "json",
                    url: file,
                    async: false,
                    success: function(data) {
                        processedFiles[file] = {};
                        if (typeof data['hide'] !== "undefined") {
                            // there are methods to hide
                            hiddenMethods[file] = data['hide'];
                            hideMethods = hideMethods.concat(data['hide']);
                        } else {
                            hiddenMethods[file] = [];
                        }
                        $.each(data[language]['methods'], function(key, val) {
                            if (hideMethods.indexOf(val['name']) == -1) {
                                addTranslatedMethod(aClass, val['name'], val['translated']);
                                var value = {'translated':val['translated'], 'displayed':val['displayed']};
                                classMethods[aClass.prototype.className][val.translated] = val.displayed;
                                processedFiles[file][val['name']] = value;
                            } else {
                                hideTranslatedMethod(aClass, val['translated']);
                            }
                        });
                    },
                    error: function(data, status, error) {
                        window.console.log("Error loading translated methods (" + file + "): " + status);
                    }
                });
            }
            return hideMethods;
        };
        
        var addTranslatedMessages = function(aClass, file, language) {
            if (typeof aClass.messages === "undefined") {
                aClass.messages = {};                
            }
            if (typeof processedFiles[file] !== "undefined") {
                // file has already been processed
                $.each(processedFiles[file], function(name, value) {
                    if (typeof aClass.messages[name] === 'undefined') {
                        // only set message if not already set
                        aClass.messages[name] = value;
                    }
                });
            } else {
                // load message file
                $.ajax({
                    dataType: "json",
                    url: file,
                    global:false,
                    async: false,
                    success: function(data) {
                        processedFiles[file] = {};
                        if (typeof data[language] !== 'undefined'){
                            $.each(data[language], function(name, value) {
                                if (typeof aClass.messages[name] === 'undefined') {
                                    // only set message if not already set
                                    aClass.messages[name] = value;
                                    processedFiles[file][name] = value;
                                }
                            });
                            window.console.log("found messages in language: "+language);
                        } else {
                            window.console.log("found no messages for language: "+language);
                        }
                    },
                    error: function(data, status, error) {
                        window.console.log("Error loading messages for class: "+aClass);
                    }
                });
            }            
        };

        this.internationalize = function(initialClass, parents) {
            var translationFile = initialClass.prototype.getResource("i18n.json");
            var messageFile = initialClass.prototype.getResource("messages.json");
            classMethods[initialClass.prototype.className] = {};
            // 1st load translated methods
            var hideMethods = addTranslatedMethods(initialClass, translationFile, this.language);
            // 2nd load translated messages
            addTranslatedMessages(initialClass, messageFile, this.language);
            // 3rd do it for parents
            if ((typeof parents !== 'undefined') && parents) {
                // internationalize parents as well
                var parentClass = Object.getPrototypeOf(initialClass.prototype);
                while (parentClass !== Object.prototype) {
                    translationFile = parentClass.getResource("i18n.json");
                    messageFile = parentClass.getResource("messages.json");
                    hideMethods = addTranslatedMethods(initialClass, translationFile, this.language, hideMethods);
                    addTranslatedMessages(initialClass, messageFile, this.language);
                    parentClass = Object.getPrototypeOf(parentClass);
                }
            }
            return initialClass;
        };

        this.getResource = function(name) {
            return this.getBaseUrl() + "/js/tangara/resources/" + name;
        };

        this.getProjectResource = function(name) {
            return project.getResourceLocation(name);
        };

        this.getMessage = function(code) {
            if (typeof this.messages[code] !== 'undefined') {
                var message = this.messages[code];
                if (arguments.length>1) {
                    // message has to be parsed
                    var elements = arguments;
                    message = message.replace(/{(\d+)}/g, function(match, number) {
                        number = parseInt(number)+1;
                        return typeof elements[number] !== 'undefined' ? elements[number]:match;
                    });
                }
                return message;
            } else {
                return code;
            }
        };
        
        this.setProject = function(value) {
            project = value;
        };
        
        this.getProject = function() {
            return project;
        };
        
        this.setProjectAvailable = function(value) {
            projectAvailable = value;
        };
        
        this.isProjectAvailable = function() {
            return projectAvailable;
        };
        
        this.getClassMethods = function(className) {
            if (typeof classMethods[className] === 'undefined') {
                return [];
            } else {
                return classMethods[className];
            }
        };

        this.getTranslatedClassMethods = function(className) {
            if (typeof tangaraObjects[className] === 'undefined') {
                return [];
            }
            var baseClass = tangaraObjects[className];
            if (typeof classMethods[baseClass] === 'undefined') {
                return [];
            } else {
                return classMethods[baseClass];
            }
        };

        this.frameReady = function(callback) {
            ready_frame = true;
            ready_callback = callback;
            this.checkReady();
        };
        
        this.runtimeReady = function() {
            ready_runtime = true;
            this.checkReady();
        };
        
        this.ready = function() {
            ready_environment = true;
            this.checkReady();
        };
        
        this.checkReady = function() {
            if (ready_frame&&ready_runtime&&ready_environment) {
                ready_callback();
            }
        };
        
        this.getConfig = function(value) {
            return this.config[value];
        };
        
        this.is3DSupported = function() {
            var canvas, ctx;
            if (support3D !== null)
                return support3D;
            try {
                canvas = createElement('canvas');
                ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            } catch (e) {
                support3D = false;
                console.log("3D functions not supported");
            }
            support3D = true;
            return support3D;
        };
        

    };

    var environmentInstance = new TEnvironment();

    environmentInstance.load();

    return environmentInstance;
});


