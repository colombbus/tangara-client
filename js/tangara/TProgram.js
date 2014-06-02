define(['TParser', 'TLink', 'TEnvironment'], function(TParser, TLink, TEnvironment) {

    function TProgram(aName) {
        var statements = new Array();
        var code = "";
        var name = null;
        var loaded = false;
        var newProgram = false;
        var modified = false;
        
        if (typeof (aName) !== 'undefined') {
            name = aName;
        } else {
            name = TEnvironment.getMessage('program-new',TProgram.newIndex);
            TProgram.newIndex++;
            newProgram = true;
        }
        
        this.save = function() {
            TLink.saveProgram(name, code, statements);
            modified = false;
        };
        
        this.load = function() {
            code = TLink.getProgramCode(name);
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
            if (!loaded && !newProgram) {
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
        
        this.getDisplayedName = function() {
            if (modified) {
                return TEnvironment.getMessage("program-modified", name);                
            } else {
                return name;
            }
        };
        
        this.setName = function(value) {
            name = value;            
        };
        
        this.getId = function() {
            return TProgram.findId(name);
        };
        
        this.setModified = function(value) {
            modified = value;
        };

        this.isModified = function() {
            return modified;
        };

    }
    
    TProgram.findId = function(name) {
        var id = new String(name);
        id = id.replace(/[\.\s]/g,"_");
        return id;
    };
    
    TProgram.newIndex = 1;
    
    return TProgram;
});


