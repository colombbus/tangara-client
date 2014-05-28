define(['TParser'], function(TParser) {

    function TProgram(aName) {
        var statements;
        var code = "";
        var name = null;
        var loaded = false;
        
        if (typeof (aName) !== 'undefined') {
            name = aName;
        }
        
        this.save = function() {
            // TODO: save file
        };
        
        this.load = function() {
            // TODO: load file
            loaded = true;
        };
        
        function parse() {
            statements = TParser.parse(code);
        }

        this.setCode = function(value) {
            code = value;
            parse();
        };

        this.getCode = function() {
            if (!loaded) {
                this.load();
            }
            return code;
        };
        
        this.getStatements = function() {
            return statements;
        };
        
        this.getName = function() {
            return name;
        };
        
        this.setName = function(value) {
            name = value;            
        };
    }
    
    return TProgram;
});


