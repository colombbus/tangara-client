define(['TParser'], function(TParser) {

    function TProgram() {
        var statements;
        var code = "";
        var name = "test";
        
        
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
        
        this.getName = function() {
            return name;
        };
        
        this.setName = function(value) {
            name = value;            
        };
    }
    
    return TProgram;
});


