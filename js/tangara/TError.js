define(['jquery', 'TEnvironment'], function($, TEnvironment) {
    function TError(e) {
        var message = "";
        var lines = new Array();
        var programName = null;
        var code = null;
        
        // Initialization from error object
        if (typeof e !== 'undefined') {
            if (typeof e.message !== 'undefined') {
                message = translate(e.message);
            }
            
            if (typeof e.loc !== 'undefined') {
               // e.loc set by acorn parser
               lines[0] = e.loc.line;
               lines[1] = e.loc.line;
           }
        }
        
        function translate(text) {
            /*if (typeof this.constructor.errors[text] !== 'undefined') {
                return this.constructor.errors[text];
            } else {
                return text;
            }*/
            return text;
        }
        
        this.setLines = function(value) {
            lines = value;
        };
        
        this.getLines = function() {
            return lines;
        };

        this.getMessage = function() {
            if (programName !== null && lines.length>0) {
                if (lines.length === 2 && lines[0] !== lines[1]) {
                    return message + " (lignes "+lines[0]+" à "+lines[1]+")";
                } else {
                    return message + " (ligne "+lines[0]+")";
                }
            }
            return message;
        };

        this.getProgramName = function() {
            return programName;
        };

        this.setProgramName = function(name) {
            programName = name;
        };
        
        this.setCode = function(value) {
            code = value;
        };
        
        this.getCode = function() {
            return code;
        };
    }

    // Load translated errors
    var errorsFile = TEnvironment.getResource("errors.json");
    window.console.log("getting errors from: " + errorsFile);    
    var language = TEnvironment.getLanguage();
    
    $.ajax({
        dataType: "json",
        url: errorsFile,
        async: false,
        success: function(data) {
            if (typeof data[language] !== 'undefined') {
                TError.constructor.errors = data[language];
                window.console.log("found errors translated in language: " + language);
            } else {
                window.console.log("found no translated errors for language: " + language);
            }
        }
    });

    return TError;
    
});
