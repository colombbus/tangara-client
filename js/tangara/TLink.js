define(['jquery', 'TUtils', 'TEnvironment', 'TUI', 'TError', 'TParser'], function($, TUtils, TEnvironment, TUI, TError, TParser) {
    var TLink = function() {
        
        this.getProgramList = function() {
            if (TEnvironment.debug)
                return ["bob.tgr", "pomme.tgr", "cubeQuest.tgr"];
            else {
                var url = TEnvironment.getBackendUrl('getprograms');
                var list = [];
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global:false,
                    async: false,
                    success: function(data) {
                        checkError(data);
                        list = data['programs'];
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        throw e;
                    }
                });
                return list;
            }
        };

        this.getProgramCode = function(name) {
            var url;
            var code = "";
            name = TUtils.getString(name);
            if (TEnvironment.debug) {
                url = TEnvironment.getUserResource(name);
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
                        throw e;
                    }
                });
            } else {
                url = TEnvironment.getBackendUrl('getcode');
                var input = {'name':name};
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global:false,
                    async: false,
                    data:input,
                    success: function(data) {
                        checkError(data);
                        code = data['code'];
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        throw e;
                    }
                });
            }
            return code;
        };

        this.getProgramStatements = function(name) {
            var statements;
            if (TEnvironment.debug) {
                try {
                    var code = this.getProgramCode(name);
                    statements = TParser.parse(code);
                } 
                catch (e) {
                    var error = new TError(e);
                    error.setProgramName(name);
                    error.setCode(code);
                    throw error;
                }
            } else {
                var url = TEnvironment.getBackendUrl('getstatements');
                var input = {'name':name};
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global:false,
                    async: false,
                    data:input,
                    success: function(data) {
                        checkError(data);
                        statements = data['statements'];
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        throw e;
                    }
                });
            }
            return statements;
        };

        this.saveProgram = function(name, code, statements) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('setprogramcontent');
                var input = {'name':name, 'code':code, 'statements':JSON.stringify(statements)};
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global:false,
                    async: false,
                    data:input,
                    success: function(data) {
                        checkError(data);
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        throw e;
                    }
                });
            }
        };

        this.createProgram = function(name) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('createprogram');
                var input = {'name':name};
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global:false,
                    async: false,
                    data:input,
                    success: function(data) {
                        checkError(data);
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        throw e;
                    }
                });
            }
        };

        this.renameProgram = function(name, newName) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('renameprogram');
                var input = {'name':name, 'new':newName};
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global:false,
                    async: false,
                    data:input,
                    success: function(data) {
                        checkError(data);
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        throw e;
                    }
                });
            }
        };

        function checkError(data) {
            if (typeof data !=='undefined' && typeof data['error'] !== 'undefined') {
                var e = new TError(TEnvironment.getMessage("backend-error-"+data['error']));
                throw e;
            }
        }

    };
    
    var linkInstance = new TLink();
    
    return linkInstance;
});