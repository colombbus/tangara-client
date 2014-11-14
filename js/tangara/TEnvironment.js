define(['jquery'], function($) {
    var TEnvironment = function() {
        var processedFiles = new Array();
        var classMethods = new Array();
        var objectLibraries = [];
        var translatedObjectNames = [];
        var tangaraObjects = {};
        var project;
        var projectAvailable = false;
        var ready_frame = false;
        var ready_runtime = false;
        var ready_environment = false;
        var ready_callback = null;
        
        
        
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
                            objectLibraries.push(lib);
                            var translatedName = val['translations'][language];
                            translatedObjectNames.push(translatedName);
                            tangaraObjects[translatedName] = key;
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
        
        this.getBackendUrl = function(module) {
            var url = window.location.protocol + "//" + window.location.host + window.location.pathname.split("/").slice(0, -2).join("/");
            url += this.config['backend-path'] + "tangarajs/";
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

        var addTranslatedMethods = function(aClass, file, language) {
            if (typeof processedFiles[file] !== "undefined") {
                // translation already loaded: we use it
                $.each(processedFiles[file], function(name, value) {
                    addTranslatedMethod(aClass, name, value.translated);
                    classMethods[aClass.prototype.className][value.translated] = value.displayed;
                    //classMethods[aClass.prototype.className].push(value);
                });
            }
            $.ajax({
                dataType: "json",
                url: file,
                async: false,
                success: function(data) {
                    processedFiles[file] = new Array();
                    window.console.log("traduction : " + file);
                    window.console.log("Language : " + language);
                    $.each(data[language]['methods'], function(key, val) {
                        addTranslatedMethod(aClass, val['name'], val['translated']);
                        var value = {'translated':val['translated'], 'displayed':val['displayed']};
                        console.log("pushing method "+value+" for class "+aClass.prototype.className);
                        classMethods[aClass.prototype.className][val.translated] = val.displayed;//.push(value);
                        processedFiles[file][val['name']] = value;
                    });
                },
                error: function(data, status, error) {
                    window.console.log("Error loading translated methods (" + file + "): " + status);
                }
            });
        };
        
        var addTranslatedMessages = function(aClass, file, language) {
            aClass.messages = new Array();
            $.ajax({
                dataType: "json",
                url: file,
                global:false,
                async: false,
                success: function(data) {
                    if (typeof data[language] !== 'undefined'){
                        aClass.messages = data[language];
                        window.console.log("found messages in language: "+language);
                    } else {
                        window.console.log("found no messages for language: "+language);
                    }
                },
                error: function(data, status, error) {
                    window.console.log("Error loading messages for class: "+aClass);
                }
            });
            
        };

        this.internationalize = function(initialClass, parents) {
            // 1st load translated methods
            var translationFile = initialClass.prototype.getResource("i18n.json");
            classMethods[initialClass.prototype.className] = {};
            addTranslatedMethods(initialClass, translationFile, this.language);
            if ((typeof parents !== 'undefined') && parents) {
                // internationalize parents as well
                var parentClass = Object.getPrototypeOf(initialClass.prototype);
                while (parentClass !== Object.prototype) {
                    translationFile = parentClass.getResource("i18n.json");
                    addTranslatedMethods(initialClass, translationFile, this.language);
                    parentClass = Object.getPrototypeOf(parentClass);
                }
            }
            // 2nd load translated messages
            // TODO: add messages from parent classes
            translationFile = initialClass.prototype.getResource("messages.json");
            addTranslatedMessages(initialClass, translationFile, this.language);
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
        

    };

    var environmentInstance = new TEnvironment();

    environmentInstance.load();

    return environmentInstance;
});


