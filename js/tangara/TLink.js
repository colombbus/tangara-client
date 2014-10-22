define(['jquery', 'TUtils', 'TEnvironment', 'TError', 'TParser'], function($, TUtils, TEnvironment, TError, TParser) {
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
                url = TEnvironment.getProjectResource(name);
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
        
        this.getResources = function() {
            if (TEnvironment.debug) {
                return {"arbre.gif":{"type":"image"}, "arrivee.png":{"type":"image"}, "bat1.png":{"type":"image"}, "bat2.png":{"type":"image"}, "bob.png":{"type":"image"}, "bob_droite_1.png":{"type":"image"}, "bob_droite_2.png":{"type":"image"}, "bob_droite_3.png":{"type":"image"}, "bob_droite_4.png":{"type":"image"}, "bob_droite_5.png":{"type":"image"}, "bob_droite_6.png":{"type":"image"}, "bob_face.png":{"type":"image"}, "bob_gauche_1.png":{"type":"image"}, "bob_gauche_2.png":{"type":"image"}, "bob_gauche_3.png":{"type":"image"}, "bob_gauche_4.png":{"type":"image"}, "bob_gauche_5.png":{"type":"image"}, "bob_gauche_6.png":{"type":"image"}, "boum.png":{"type":"image"}, "cle.png":{"type":"image"}, "ennemi.png":{"type":"image"}, "ennemi2.png":{"type":"image"}, "ennemi3.png":{"type":"image"}, "fini.png":{"type":"image"}, "fond.png":{"type":"image"}, "game over.png":{"type":"image"}, "gameover.png":{"type":"image"}, "maison.gif":{"type":"image"}, "mechant1.png":{"type":"image"}, "mechant2.png":{"type":"image"}, "menujeu.png":{"type":"image"}, "niveau1.png":{"type":"image"}, "niveau2.png":{"type":"image"}, "niveau3.png":{"type":"image"}, "niveau4.png":{"type":"image"}, "niveau5.png":{"type":"image"}, "niveau6.png":{"type":"image"}, "niveau7.png":{"type":"image"}, "niveau8.png":{"type":"image"}, "nok1.png":{"type":"image"}, "nok2.png":{"type":"image"}, "nok3.png":{"type":"image"}, "ok.png":{"type":"image"}, "perso.png":{"type":"image"}, "pomme.gif":{"type":"image"}, "porte.png":{"type":"image"}, "porte_ouverte.png":{"type":"image"}, "sol.gif":{"type":"image"}};
            } else {  
                var url = TEnvironment.getBackendUrl('getresources');
                var list = [];
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global:false,
                    async: false,
                    success: function(data) {
                        checkError(data);
                        list = data['resources'];
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        throw e;
                    }
                });
                return list;
            }
        };

        this.getResourceLocation = function(name, version) {
            if (TEnvironment.debug) {
                return TEnvironment.getBaseUrl() + "/tests/" + name;
            } else {
                return TEnvironment.getBackendUrl('getresource')+"/"+version+"/"+encodeURIComponent(name);
            }
        };
        
        this.renameResource = function(name, newBaseName) {
            var newName = name;
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('renameresource');
                var input = {'name':name, 'new':newBaseName};
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global:false,
                    async: false,
                    data:input,
                    success: function(data) {
                        checkError(data);
                        if (typeof data['updated'] !== 'undefined') {
                            newName = data['updated'];
                        } else {
                            console.log("error: no updated field provided");
                        }
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        throw e;
                    }
                });
            }
            return newName;
        };
        
        this.deleteProgram = function(name) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('removeprogram');
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

        this.deleteResource = function(name) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('removeresource');
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
        
        this.setResourceContent = function(name, data) {
            var resource={};
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('setresource');
                var input = {'name':name, 'data':data};
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global:false,
                    async: false,
                    data:input,
                    success: function(data) {
                        checkError(data);
                        resource = {'name':data.updated, 'data':data.data};
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        throw e;
                    }
                });
            }
            return resource;
        };
        
        this.duplicateResource = function(name) {
            var resource={};
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('duplicateresource');
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
                        resource = {'name':data.created, 'data':data.data};
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        throw e;
                    }
                });
            }
            return resource;
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