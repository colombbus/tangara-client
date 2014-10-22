define(['TParser', 'TLink', 'TEnvironment', 'TUtils'], function(TParser, TLink, TEnvironment, TUtils) {

    function TProgram(value) {
        var statements = new Array();
        var code = "";
        var name = null;
        var loaded = false;
        var newProgram = false;
        var modified = false;
        var codeChanged = false;
        
        if (TUtils.checkString(value)) {
            name = value;
        } else {
            var used = [];
            if (TUtils.checkArray(value)) {
                used = value;
            }
            var index = 0;
            do {
                index++;
                name = TEnvironment.getMessage('program-new',index);
            } while (used.indexOf(name) > -1)
            window.console.log("New name : "+name);
            newProgram = true;
        }
        
        this.save = function() {
            if (newProgram) {
                // First create program
                TLink.createProgram(name);
                newProgram = false;
            }
            if (codeChanged) {
                // Try to parse program
                try {
                    parse();
                    codeChanged = false;
                } catch (e) {
                    statements = [];
                    window.console.log("Error parsing program '"+name+"'");
                }
            }
            TLink.saveProgram(name, code, statements);
            modified = false;
        };
        
        this.load = function() {
            code = TLink.getProgramCode(name);
            codeChanged = true;
            loaded = true;
        };
        
        function parse() {
            if (code.trim().length > 0) {
                statements = TParser.parse(code);
            } else {
                statements = [];
            }
            codeChanged = false;
        }

        this.setCode = function(value) {
            code = value;
            codeChanged = true;
        };

        this.getCode = function() {
            if (!loaded && !newProgram) {
                this.load();
            }
            return code;
        };
        
        this.getStatements = function() {
            if (codeChanged) {
                parse();
            }
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
        
        this.rename = function(value) {
            if (!newProgram) {
                TLink.renameProgram(name, value);
                name = value;
            } else {
                // New Program: we try to create the program
                TLink.createProgram(value);
                name = value;
                newProgram = false;
            }
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

        this.isNew = function() {
            return newProgram;
        };
        
        this.delete = function() {
            if (!newProgram) {
                TLink.deleteProgram(name);
            }
        };
    }
    
    TProgram.findId = function(name) {
        var id = new String(name);
        id = id.replace(/[\.\s]/g,"_");
        return id;
    };
    
    return TProgram;
});


