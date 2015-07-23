define(['TParser', 'TLink', 'TEnvironment', 'TUtils', 'TError'], function(TParser, TLink, TEnvironment, TUtils, TError) {

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
                name = TEnvironment.getMessage('program-new', index);
            } while (used.indexOf(name) > -1);
            newProgram = true;
        }

        this.save = function(callback) {
            if (newProgram) {
                // First create program
                TLink.createProgram(name, function(error) {
                    if (typeof error !== 'undefined') {
                        // error: just forward it
                        callback.call(this, error);
                    } else {
                        newProgram = false;
                        if (codeChanged) {
                            // Try to parse program
                            try {
                                parse();
                                codeChanged = false;
                            } catch (e) {
                                statements = [];
                                window.console.error("Error parsing program '" + name + "'");
                            }
                        }
                        TLink.saveProgram(name, code, statements, function(error) {
                            if (typeof error !== 'undefined') {
                                // error: forward it
                                callback.call(this, error);
                            } else {
                                modified = false;
                                callback.call(this);
                            }
                        });
                    }
                });
            } else {
                if (codeChanged) {
                    // Try to parse program
                    try {
                        parse();
                        codeChanged = false;
                    } catch (e) {
                        statements = [];
                        window.console.error("Error parsing program '" + name + "'");
                    }
                }
                TLink.saveProgram(name, code, statements, function(error) {
                    if (typeof error !== 'undefined') {
                        // error: forward it
                        callback.call(this, error);
                    } else {
                        modified = false;
                        callback.call(this);
                    }
                });
            }
        };

        this.load = function(callback) {
            TLink.getProgramCode(name, function(codeData) {
                if (codeData instanceof TError) {
                    callback.call(this, codeData);
                } else {
                    code = codeData;
                    codeChanged = true;
                    loaded = true;
                    callback.call(this);
                }
            });
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

        this.rename = function(value, callback) {
            if (!newProgram) {
                TLink.renameProgram(name, value, function(error) {
                    if (typeof error !== 'undefined') {
                        window.console.log("error detected");
                        window.console.debug(error);
                        callback.call(this, error);
                    } else {
                        name = value;
                        callback.call(this);
                    }
                });
            } else {
                // New Program: we try to create the program
                TLink.createProgram(value, function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        name = value;
                        newProgram = false;
                        callback.call(this);
                    }
                });
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

        this.delete = function(callback) {
            if (!newProgram) {
                TLink.deleteProgram(name, function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        callback.call(this);
                    }
                });
            } else {
                callback.call(this);
            }
        };
    }

    function hashCode(value) {
        var hash = 0, i, chr, len;
        if (value.length === 0)
            return hash;
        for (i = 0, len = value.length; i < len; i++) {
            chr = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString(16);
    }


    TProgram.findId = function(name) {
        var id = hashCode(name);
        return id;
    };

    return TProgram;
});


