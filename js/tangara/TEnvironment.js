define(['jquery'], function($) {
    var TEnvironment = function() {
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
                    if (typeof data[language] !== 'undefined') {
                        parent.messages = data[language];
                        window.console.log("found messages in language: " + language);
                    } else {
                        window.console.log("found no messages for language: " + language);
                    }
                }
            });
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
            Object.defineProperty(aClass, translated, {
                enumerable: false,
                configurable: false,
                writable: false}); // DOES NOT WORK
        };

        var addTranslatedMethods = function(aClass, file, language) {
            if (typeof translated[file] !== "undefined") {
                // translation already loaded: we use it
                $.each(translated[file], function(name, translated) {
                    addTranslatedMethod(aClass, name, translated);
                });
            }
            $.ajax({
                dataType: "json",
                url: file,
                async: false,
                success: function(data) {
                    translated[file] = new Array();
                    window.console.log("traduction : " + file);
                    window.console.log("Language : " + language);
                    $.each(data[language]['methods'], function(key, val) {
                        addTranslatedMethod(aClass, val['name'], val['translated']);
                        translated[file][val['name']] = val['translated'];
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

        this.getResource = function(location) {
            return this.getBaseUrl() + "/js/tangara/resources/" + location;
        };

        this.getUserResource = function(location) {
            // TODO: to be replaced with user directory management
            return this.getBaseUrl() + "/tests/" + location;
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

    };

    var environmentInstance = new TEnvironment();

    environmentInstance.load();

    return environmentInstance;
});


