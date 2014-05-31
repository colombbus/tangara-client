define(['jquery', 'TUI', 'TEnvironment', 'TRuntime', 'TUtils', 'TObject', 'TParser'], function($, TUI, TEnvironment, TRuntime, TUtils, TObject, TParser) {
    var Tangara = function() {
        window.console.log("Initializing tangara");
        TObject.call(this);
    };

    Tangara.prototype = Object.create(TObject.prototype);
    Tangara.prototype.constructor = Tangara;
    Tangara.prototype.className = "Tangara";

    Tangara.prototype._write = function(value) {
        value = TUtils.getString(value);
        TUI.addLogMessage(value);
    };

    Tangara.prototype._alert = function(value) {
        value = TUtils.getString(value);
        window.alert(value);
    };

    Tangara.prototype._loadScript = function(name) {
        // TODO : get parsed version directly
        name = TUtils.getString(name);
        var scriptUrl = TEnvironment.getUserResource(name);
        var parent = this;
        $.ajax({
            dataType: "text",
            url: scriptUrl,
            async: false,
            success: function(data) {
                TRuntime.setCurrentProgramName(name);
                var statements = TParser.parse(data);
                TRuntime.executeStatements(statements);
            }
        }).fail(function(jqxhr, textStatus, error) {
            throw new Error(parent.getMessage("script unreachable", name));
        });
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



