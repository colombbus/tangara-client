define(['jquery', 'TUI', 'TEnvironment', 'TRuntime', 'TUtils', 'TObject', 'TParser'], function($, TUI, TEnvironment, TRuntime, TUtils, TObject, TParser) {
    var Tangara = function() {
        window.console.log("Initializing tangara");
        TObject.call(this);
    };

    Tangara.prototype = Object.create(TObject.prototype);
    Tangara.prototype.constructor = Tangara;
    Tangara.prototype.className = "Tangara";

    Tangara.prototype._write = function(value) {
        if (TUtils.checkString(value)) {
            TUI.addLogMessage(value);
        }
    };

    Tangara.prototype._alert = function(value) {
        if (TUtils.checkString(value)) {
            window.alert(value);
        }
    };

    Tangara.prototype._loadScript = function(name) {
        // TODO : get parsed version directly
        if (TUtils.checkString(name)) {
            var scriptUrl = TEnvironment.getUserResource(name);
            var parent = this;
            $.ajax({
                dataType: "text",
                url: scriptUrl,
                async: false,
                success: function(data) {
                    try {
                        var statements = TParser.parse(data);
                        TRuntime.executeStatements(statements);
                    } catch (e) {
                        // TODO: real error management
                        if (typeof e.loc !== 'undefined') {
                            var line = e.loc.line;
                            window.alert("Erreur de syntaxe : "+e.message+"\n(ligne : "+line+")");
                        } else {
                            window.alert("Erreur : "+e.message);
                        }
                    }
                }
            }).fail(function(jqxhr, textStatus, error) {
                throw new Error(TUtils.format(parent.getMessage("script unreachable"), name));
            });
        }
    };

    Tangara.prototype._pause = function() {
        TRuntime.stop();
    };


    Tangara.prototype._unpause = function() {
        TRuntime.start();
    };

    TEnvironment.internationalize(Tangara);

    var tangaraInstance = new Tangara();

    return tangaraInstance;
});



