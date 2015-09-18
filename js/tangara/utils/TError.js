define(['jquery', 'TEnvironment', 'TUtils'], function($, TEnvironment, TUtils) {
    /**
     * TError is used to format and draw error messages.
     * @exports TError
     * @param {type} e
     */
    function TError(e) {
        var message = "";
        var lines = [];
        var programName = null;
        var code = null;

        var detectRegex_undefined = /(\S*)\sis\snot\sdefined/i;
        var detectRegex_not_a_function = /(\S*)\sis\snot\sa\sfunction/i;
        var detectRegex_syntax_error = /Unexpected\stoken\s/i;
        var detectRegex_not_a_variable = /Can\'t\sfind\svariable\:\s(\S*)/i;
        var detectRegex_unterminated_string = /Unterminated\sstring\sconstant/i;
        var detectRegex_unknown_function = /unknown\sfunction/i;

        // Initialization from error object
        if (typeof e !== 'undefined') {
            if (typeof e === 'string') {
                message = translate(e);
            } else {
                if (typeof e.message !== 'undefined') {
                    message = translate(e.message);
                }
                if (typeof e.loc !== 'undefined') {
                    // e.loc set by acorn parser
                    lines[0] = e.loc.line;
                    lines[1] = e.loc.line;
                }
            }
        }

        /**
         * Translate an error.
         * @param {String} text
         * @returns {String}    Returns the translated error, or the original
         * string if failed.
         */
        function translate(text) {
            if (typeof TError.errors !== 'undefined' && typeof TError.errors[text] !== 'undefined') {
                var translatedText = TError.errors[text];
                if (arguments.length > 1) {
                    // message has to be parsed
                    var elements = arguments;
                    translatedText = translatedText.replace(/{(\d+)}/g, function(match, number) {
                        number = parseInt(number) + 1;
                        return typeof elements[number] !== 'undefined' ? elements[number] : match;
                    });
                }
                return translatedText;
            } else {
                return text;
            }
        }

        /**
         * Set lines to value.
         * @param {Number[]} value
         */
        this.setLines = function(value) {
            lines = value;
        };

        /**
         * Get the value of lines.
         * @returns {Number[]}
         */
        this.getLines = function() {
            return lines;
        };

        /**
         * Get the error message.
         * @returns {String}
         */
        this.getMessage = function() {
            if (programName !== null && typeof lines !== 'undefined' && lines.length > 0) {
                if (lines.length === 2 && lines[0] !== lines[1]) {
                    return message + " (lignes " + lines[0] + " à " + lines[1] + ")";
                } else {
                    return message + " (ligne " + lines[0] + ")";
                }
            }
            return message;
        };

        /**
         * Get the Program Name.
         * @returns {String} 
         */
        this.getProgramName = function() {
            return programName;
        };

        /**
         * Set the Program Name to name.
         * @param {String} name
         * @returns {undefined}
         */
        this.setProgramName = function(name) {
            programName = name;
        };

        /**
         * Set code to value.
         * @param {String} value
         */
        this.setCode = function(value) {
            code = value;
        };

        /**
         * Get code.
         * @return {String}
         */
        this.getCode = function() {
            return code;
        };

        /**
         * Detect the error, translate it into an user-friendly message and
         * draw it.
         */
        this.detectError = function() {
            // Undefined 
            var result = detectRegex_undefined.exec(message);
            if (result !== null && result.length > 0) {
                var name = result[1];
                name = TUtils.convertUnicode(name);
                message = translate("runtime-error-undefined", name);
                return;
            }
            // Not a function 
            var result = detectRegex_not_a_function.exec(message);
            if (result !== null && result.length > 0) {
                var name = result[1];
                name = TUtils.convertUnicode(name);
                if (name === 'undefined') {
                    message = translate("runtime-error-undefined-not-a-function");
                } else {
                    message = translate("runtime-error-not-a-function", name);
                }
                return;
            }
            var result = detectRegex_syntax_error.exec(message);
            if (result !== null) {
                message = translate("runtime-error-syntax-error");
                return;
            }
            var result = detectRegex_not_a_variable.exec(message);
            if (result !== null && result.length > 0) {
                var name = result[1];
                name = TUtils.convertUnicode(name);
                message = translate("runtime-error-not-variable-error", name);
                return;
            }
            var result = detectRegex_unterminated_string.exec(message);
            if (result !== null) {
                message = translate("runtime-error-unterminated-string-error");
                return;
            }
            var result = detectRegex_unknown_function.exec(message);
            if (result !== null) {
                message = translate("runtime-error-unknown-function");
                return;
            }
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
                TError.errors = data[language];
                window.console.log("found errors translated in language: " + language);
            } else {
                window.console.log("found no translated errors for language: " + language);
            }
        }
    });

    return TError;

});
