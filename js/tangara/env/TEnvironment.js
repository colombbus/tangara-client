define(['jquery'], function($) {
    var TEnvironment = function() {
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
        this.config = {"debug": false, "backend-path": "/tangara-ui/web/app.php/"};
        this.debug;

        this.load = function(callback) {
            window.console.log("*** Loading Tangara Environment ***");
            window.console.log("* Loading config");
            var configFile = this.getResource("config.json");
            var self = this;
            $.ajax({
                dataType: "json",
                url: configFile,
                success: function(data) {
                    $.extend(self.config, data);
                    self.debug = self.config['debug'];
                    if (self.config['document-domain']) {
                        document.domain = self.config['document-domain'];
                    }
                    window.console.log("* Retrieving translated messages");
                    var messageFile = self.getResource("messages.json");
                    window.console.log("getting messages from: " + messageFile);
                    var language = self.language;
                    $.ajax({
                        dataType: "json",
                        url: messageFile,
                        success: function(data) {
                            if (typeof data[language] !== 'undefined') {
                                self.messages = data[language];
                                window.console.log("found messages in language: " + language);
                            } else {
                                window.console.log("found no messages for language: " + language);
                            }
                            self.ready();
                            if (typeof callback !== 'undefined') {
                                callback.call(self);
                            }
                        }
                    });
                    
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

        this.getBackendUrl = function(module) {
            var url = window.location.protocol + "//" + window.location.host + window.location.pathname.split("/").slice(0, -2).join("/");
            url += this.config['backend-path'] + "assets/";
            if (typeof module !== "undefined") {
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

        this.getResource = function(name) {
            return this.getBaseUrl() + "/resources/" + name;
        };

        this.getProjectResource = function(name) {
            return project.getResourceLocation(name);
        };

        this.getMessage = function(code) {
            if (typeof this.messages[code] !== 'undefined') {
                var message = this.messages[code];
                if (arguments.length > 1) {
                    // message has to be parsed
                    var elements = arguments;
                    message = message.replace(/{(\d+)}/g, function(match, number) {
                        number = parseInt(number) + 1;
                        return typeof elements[number] !== 'undefined' ? elements[number] : match;
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
            if (ready_frame && ready_runtime && ready_environment) {
                ready_callback();
            }
        };

        this.getConfig = function(value) {
            return this.config[value];
        };

        this.is3DSupported = function() {
            var canvas, gl;
            if (support3D !== null)
                return support3D;
            try {
                canvas = document.createElement('canvas');
                gl = canvas.getContext('webgl');
            } catch (e) {
                gl = null;
            }
            if (gl === null) {
                try {
                    gl = canvas.getContext("experimental-webgl");
                }
                catch (e) {
                    gl = null;
                }
            }
            if (gl === null) {
                support3D = false;
                console.log("3D functions not supported");
            } else {
                support3D = true;
                console.log("3D functions supported");
            }
            return support3D;
        };


    };

    var environmentInstance = new TEnvironment();

    return environmentInstance;
});


