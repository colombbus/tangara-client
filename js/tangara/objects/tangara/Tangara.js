define(['jquery', 'TEnvironment', 'TUtils', 'TObject'], function($, TEnvironment, TUtils, TObject) {
    var Tangara = function() {
        window.console.log("Initializing tangara");
        TObject.call(this);
    };

    Tangara.prototype = new TObject();
    Tangara.prototype.constructor = Tangara;
    Tangara.prototype.className = "Tangara";

    Tangara.prototype._write = function(value) {
        if (TUtils.checkString(value)) {
            TEnvironment.addLogMessage(value);
        }
    };

    Tangara.prototype._alert = function(value) {
        if (TUtils.checkString(value)) {
            window.alert(value);
        }
    };

    Tangara.prototype._loadScript = function(name) {
        if (TUtils.checkString(name)) {
            var scriptUrl = TEnvironment.getUserResource(name);
            var parent = this;
            $.ajax({
                dataType: "text",
                url: scriptUrl,
                async: false,
                success: function(data) {
                    TEnvironment.execute(data);
                }
            }).fail(function(jqxhr, textStatus, error) {
                throw new Error(TUtils.format(parent.getMessage("script unreachable"), name));
            });
        }
    };

    Tangara.prototype._pause = function() {
        TEnvironment.pause();
    };


    Tangara.prototype._unpause = function() {
        TEnvironment.unpause();
    };

    TEnvironment.internationalize(Tangara);

    var tangaraInstance = new Tangara();

    return tangaraInstance;
});



