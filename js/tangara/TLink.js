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
                        if (checkError(data))
                            list = data['programs'];
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        TUI.addLogError(e);
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
                        TUI.addLogError(e);
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
                        if (checkError(data))
                            code = data['code'];
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        TUI.addLogError(e);
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
                        if (checkError(data))
                            statements = data['statements'];
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        TUI.addLogError(e);
                    }
                });
            }
            return statements;
        };

        this.saveProgram = function(name, code, statements) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('setprogramcontent');
                var input = {'name':name, 'code':code, 'statements':JSON.stringify(statements)};
                var result = false;
                $.ajax({
                    dataType: "text",
                    url: url,
                    type: "POST",
                    global:false,
                    async: false,
                    data:input,
                    success: function(data) {
                        result = checkError(data);
                        if (result)
                            TUI.addLogMessage(TEnvironment.getMessage('program-saved', name));
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        TUI.addLogError(e);
                    }
                });
                return result;
            } else {
                return true;
            }
        };

        this.createProgram = function(name) {
            var result;
            if (TEnvironment.debug) {
                result = true;
            } else {
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
                        result = checkError(data);
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        TUI.addLogError(e);
                        result = false;
                    }
                });
            }
            return result;
        };

        this.renameProgram = function(name, newName) {
            var result;
            if (TEnvironment.debug) {
                result = true;
            } else {
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
                        result = checkError(data);
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        TUI.addLogError(e);
                        result = false;
                    }
                });
            }
            return result;
        };

        function checkError(data) {
            if (typeof data !=='undefined' && typeof data['error'] !== 'undefined') {
                var e = new TError(TEnvironment.getMessage("backend-error-"+data['error']));
                TUI.addLogError(e);
                return false;
            }
            return true;
        }

    };
    
    var linkInstance = new TLink();
    
    return linkInstance;
});