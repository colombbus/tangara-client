define(['jquery', 'TUtils', 'TEnvironment', 'TUI', 'TError', 'TParser'], function($, TUtils, TEnvironment, TUI, TError, TParser) {
    var TLink = function() {
        
        this.getProgramList = function() {
            // TODO: plug with backend
            return ["bob.tgr", "pomme.tgr"];
        };

        this.getProgramCode = function(name) {
            // TODO: plug with backend
            name = TUtils.getString(name);
            var url = TEnvironment.getUserResource(name);
            var code = "";
            $.ajax({
                dataType: "text",
                url: url,
                global:false,
                async: false,
                success: function(data) {
                    code = data;
                },
                error: function(data, status, error) {
                    var e = new TError(error);
                    TUI.addLogError(e);
                }
            });
            return code;
        };

        this.getProgramStatements = function(name) {
            // TODO: plug with backend
            var code = this.getProgramCode(name);
            return TParser.parse(code);
        };

        this.saveProgram = function(name, code, statements) {
            // TODO: plug with backend
        };

    };
    
    var linkInstance = new TLink();
    
    return linkInstance;
});