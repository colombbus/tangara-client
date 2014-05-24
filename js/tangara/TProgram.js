define(['TParser'], function(TParser) {

    function TProgram() {
        var saved = false;
        var dirty = true;
        var editor;
        var statements;
        var code = "";
        
        
        this.setDirty = function(value) {
            dirty = value;
            if (dirty) {
                saved = false;
            }
        };

        this.save = function() {
            // TODO: save file
            saved = true;
        };

        
        this.setCode = function(value) {
            code = value;
        };
        
        function updateCode() {
            code = editor.getValue();
        };
        
        this.setEditor = function(value) {
            editor = value;
        };
        
        function parse() {
            statements = TParser.parse(code);
        }
        
        this.getStatements = function() {
            if (dirty) {
                updateCode();
                parse();
                dirty = false;
            }
            return statements;
        };
    }
    
    return TProgram;
});


