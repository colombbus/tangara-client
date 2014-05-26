define(['TParser'], function(TParser) {

    function TProgram() {
        var statements;
        var code = "";
        
        
        this.save = function() {
            // TODO: save file
        };
        
        function parse() {
            statements = TParser.parse(code);
        }

        this.setCode = function(value) {
            code = value;
            parse();
        };
       
        this.getStatements = function() {
            return statements;
        };
    }
    
    return TProgram;
});


