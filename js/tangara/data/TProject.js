define(['TLink', 'TProgram', 'TEnvironment', 'TUtils', 'TError', 'TRuntime'], function(TLink, TProgram, TEnvironment, TUtils, TError, TRuntime) {
    function TProject() {

        var name;
        var id;
        var programs = [];
        var resourcesNames = [];
        var resources = {};
        var editedPrograms = {};
        var sessions = {};
        var editedProgramsNames = [];
        var editedProgramsArray = [];

        this.setName = function(value) {
            name = value;
        };

        this.getName = function() {
            return name;
        };

        this.setId = function(value) {
            id = value;
            TLink.setProjectId(value);
        };

        this.getId = function() {
            return id;
        };

        this.renameProgram = function(oldName, newName, callback) {
            if (typeof editedPrograms[oldName] !== 'undefined') {
                var program = editedPrograms[oldName];
                program.rename(newName, function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        // add newname records
                        programs.push(newName);
                        sessions[newName] = sessions[oldName];
                        editedPrograms[newName] = editedPrograms[oldName];

                        // remove oldname records
                        var i = programs.indexOf(oldName);
                        if (i > -1) {
                            // Should always be the case
                            programs.splice(i, 1);
                        }
                        delete sessions[oldName];
                        delete editedPrograms[oldName];

                        // update programs lists
                        programs = TUtils.sortArray(programs);
                        updateEditedPrograms();
                        callback.call(this);
                    }
                });
            }
        };

        this.createProgram = function() {
            var program = new TProgram(programs);
            var name = program.getName();
            programs.push(name);
            programs = TUtils.sortArray(programs);
            editedPrograms[name] = program;
            updateEditedPrograms();
            return program;
        };

        this.updateSession = function(program, session) {
            sessions[program.getName()] = session;
            program.setCode(session.getValue());
        };

        this.saveProgram = function(program, callback, session) {
            if (typeof session !== 'undefined') {
                this.updateSession(program, session);
            }
            program.save(callback);
        };

        this.getEditedProgram = function(name) {
            if (typeof editedPrograms[name] !== 'undefined') {
                return editedPrograms[name];
            }
            return false;
        };

        this.editProgram = function(name, callback, session) {
            if (typeof editedPrograms[name] === 'undefined') {
                var program = new TProgram(name);
                program.load(function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        editedPrograms[name] = program;
                        // sort editing programs alphabetically
                        updateEditedPrograms();
                        callback.call(this);
                    }
                });
            }
        };

        this.getProgramStatements = function(name, callback) {
            if (typeof editedPrograms[name] === 'undefined') {
                var program = new TProgram(name);
                program.load(function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        editedPrograms[name] = program;
                        // sort editing programs alphabetically
                        updateEditedPrograms();
                        var result;
                        try {
                            result = program.getStatements();
                        } catch(e) {
                            result = new TError(e);
                        }
                        callback.call(this, result);
                    }
                });
            } else {
                var program = editedPrograms[name];
                callback.call(this, program.getStatements());
            }
        };
        
        this.getProgramCode = function(name, callback) {
            if (typeof editedPrograms[name] === 'undefined') {
                var program = new TProgram(name);
                program.load(function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        editedPrograms[name] = program;
                        // sort editing programs alphabetically
                        updateEditedPrograms();
                        callback.call(this, program.getCode());
                    }
                });
            } else {
                var program = editedPrograms[name];
                callback.call(this, program.getCode());
            }
        };

        this.isProgramEdited = function(name) {
            return (typeof editedPrograms[name] !== 'undefined');
        };

        this.closeProgram = function(name) {
            if (typeof editedPrograms[name] === 'undefined') {
                return false;
            }
            var program = editedPrograms[name];
            if (program.isModified()) {
                var goOn = window.confirm(TEnvironment.getMessage('close-confirm', name));
                if (!goOn) {
                    return false;
                }
            }
            delete editedPrograms[name];
            delete sessions[name];
            updateEditedPrograms();
            if (program.isNew()) {
                // program is still new (i.e. not saved) : we remove it from programs list
                var i = programs.indexOf(program.getName());
                if (i > -1) {
                    // Should always be the case
                    programs.splice(i, 1);
                }
            }
            return true;
        };

        this.findPreviousEditedProgram = function(name) {
            if (editedProgramsNames.length === 0) {
                return false;
            }
            var value = editedProgramsNames[0];
            name = name.toLowerCase();
            for (var i = 1; i < editedProgramsNames.length; i++) {
                if (name.localeCompare(editedProgramsNames[i].toLowerCase()) > 0) {
                    value = editedProgramsNames[i];
                }
            }
            return editedPrograms[value];
        };

        this.getSession = function(program) {
            return sessions[program.getName()];
        };

        this.setSession = function(program, session) {
            sessions[program.getName()] = session;
        };


        this.getProgramsNames = function() {
            return programs;
        };

        this.getEditedPrograms = function() {
            return editedPrograms;
        };

        this.getEditedProgramsNames = function() {
            return editedProgramsNames;
        };

        this.getEditedPrograms = function() {
            return editedProgramsArray;
        };

        this.init = function(callback) {
            programs = [];
            editedPrograms = {};
            resources = {};
            resourcesNames = [];
            sessions = {};
            editedProgramsNames = [];
            editedProgramsArray = [];
            // get program list
            var self = this;
            TLink.getProgramList(function(arg) {
                if (arg instanceof TError) {
                    // error sent: stop there
                    TEnvironment.setProjectAvailable(false);
                    window.console.error(arg.getMessage());
                    callback.call(this);                    
                } else {
                    programs = arg;
                    // sort programs and resources alphabetically
                    programs = TUtils.sortArray(programs);
                    // get resource list
                    TLink.getResources(function(arg) {
                        if (arg instanceof TError) {
                            // error sent: stop there
                            TEnvironment.setProjectAvailable(false);
                        } else {
                            resources = arg;
                            resourcesNames = Object.keys(resources);
                            resourcesNames = TUtils.sortArray(resourcesNames);
                            TEnvironment.setProjectAvailable(true);
                            self.preloadImages();
                        }
                        callback.call(this);
                    });
                }
            });
        };

        this.getResourcesNames = function() {
            return resourcesNames;
        };

        this.getResources = function() {
            return resources;
        };

        this.getResourceInfo = function(name) {
            if (typeof resources[name] !== 'undefined') {
                return resources[name];
            } else {
                var e = new TError(TEnvironment.getMessage("resource-unknown", name));
                throw e;
            }
        };

        this.getNewResourceIndex = function(name) {
            var i;
            for (i = 0; i < resourcesNames.length; i++) {
                var current = resourcesNames[i];
                var result = current.toLowerCase().localeCompare(name.toLowerCase());
                if (result === 0) {
                    // problem: resource name already exists
                    var e = new TError(TEnvironment.getMessage("resource-name-exists", name));
                    throw e;
                }
                if (result > 0) {
                    break;
                }
            }
            return i;
        };

        this.uploadingResource = function(name) {
            if (typeof resources[name] !== 'undefined') {
                var e = new TError(TEnvironment.getMessage("resource-already-exists", name));
                throw e;
            }
            resources[name] = {'type': 'uploading'};
            var i = this.getNewResourceIndex(name);
            resourcesNames.splice(i, 0, name);
            return i;
        };

        this.resourceUploaded = function(name, data) {
            resources[name] = data;
            if (data.type === 'image') {
                // preload image
                var img = new Image();
                img.src = this.getResourceLocation(name);
            }
        };

        this.removeUploadingResource = function(name) {
            if (typeof resources[name] !== 'undefined') {
                resources[name] = undefined;
            }
            var i = resourcesNames.indexOf(name);
            if (i > -1) {
                resourcesNames.splice(i, 1);
            }
        };

        this.renameResource = function(name, newBaseName, callback) {
            var i = resourcesNames.indexOf(name);
            if (i > -1) {
                // resource exists
                var resource = resources[name];
                // check that resource is not uploading
                var type = resource.type;
                if (type === 'uploading') {
                    throw new TError(TEnvironment.getMessage('resource-not-uploaded'));
                }
                var self = this;
                TLink.renameResource(name, newBaseName, function(newName) {
                    if (newName instanceof TError) {
                        // error: just forward it
                        callback.call(this, newName);
                    } else {
                        // remove old name
                        resourcesNames.splice(i, 1);
                        // add new name
                        resourcesNames.push(newName);
                        resources[newName] = resources[name];
                        resources[newName]['base-name'] = newBaseName;
                        delete resources[name];

                        // update programs lists
                        resourcesNames = TUtils.sortArray(resourcesNames);

                        // preload image if required with new name
                        if (type === 'image') {
                            self.preloadImage(newName);
                        }
                        callback.call(this, newName);
                    }
                });
            }
        };

        this.setResourceContent = function(name, data, callback) {
            var self = this;
            TLink.setResourceContent(name, data, function(newData) {
                if (newData instanceof TError) {
                    // error: just forward it
                    callback.call(this, newData);
                } else {
                    var newName = newData['name'];
                    if (newName !== name) {
                        // name has changed
                        // remove old name
                        var i = resourcesNames.indexOf(name);
                        resourcesNames.splice(i, 1);
                        // add new name
                        resourcesNames.push(newName);
                        delete resources[name];
                        // update programs lists
                        resourcesNames = TUtils.sortArray(resourcesNames);
                        name = newName;
                    }
                    resources[name] = newData['data'];
                    // preload image
                    self.preloadImage(name);
                    callback.call(this, name);
                }
            });
        };

        this.getResourceLocation = function(name) {
            return TLink.getResourceLocation(name, resources[name].version);
        };

        this.getResourceBaseName = function(name) {
            return resources[name]['base-name'];
        };

        this.preloadImage = function(name) {
            var img = new Image();
            img.src = this.getResourceLocation(name);
        };

        this.preloadImages = function() {
            /*for (var i=0; i<resourcesNames.length; i++) {
             var name = resourcesNames[i];
             if (resources[name].type === 'image') {
             this.preloadImage(name);
             }
             }*/
        };

        this.isUnsaved = function() {
            for (var i = 0; i < editedProgramsNames.length; i++) {
                var program = editedPrograms[editedProgramsNames[i]];
                if (program.isModified()) {
                    return true;
                }
            }
            return false;
        };

        this.deleteProgram = function(name, callback) {
            if (typeof editedPrograms[name] !== 'undefined') {
                var program = editedPrograms[name];
                program.delete(function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        // delete corresponding records
                        var i = programs.indexOf(name);
                        if (i > -1) {
                            // Should always be the case
                            programs.splice(i, 1);
                        }
                        delete sessions[name];
                        delete editedPrograms[name];

                        // update programs lists
                        updateEditedPrograms();
                        callback.call(this);
                    }
                });
            }
        };

        this.deleteResource = function(name, callback) {
            var i = resourcesNames.indexOf(name);
            if (i > -1) {
                // resource exists
                var resource = resources[name];
                // check that resource is not uploading
                var type = resource.type;
                if (type === 'uploading') {
                    //TODO: find a way to cancel upload?
                    callback.call(this, new TError(TEnvironment.getMessage('resource-not-uploaded')));
                }
                TLink.deleteResource(name, function(error) {
                    if (typeof error !== 'undefined') {
                        // error: just forward it
                        callback.call(this, error);
                    } else {
                        // remove name
                        resourcesNames.splice(i, 1);
                        delete resources[name];
                        callback.call(this);
                    }
                });
            }
        };

        this.duplicateResource = function(name, callback) {
            var self = this;
            TLink.duplicateResource(name, function(newData) {
                if (newData instanceof TError) {
                    // error: just forward it
                    callback.call(this, newData);
                } else {
                    var newName = newData['name'];
                    resourcesNames.push(newName);
                    resourcesNames = TUtils.sortArray(resourcesNames);
                    resources[newName] = newData['data'];
                    // preload image
                    self.preloadImage(newName);
                    callback.call(this, newName);
                }
            });
        };

        this.createResource = function(name, width, height, callback) {
            // create image
            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            var imageData = canvas.toDataURL();
            var self = this;
            TLink.createResource(name, imageData, function(newData) {
                if (newData instanceof TError) {
                    // error: just forward it
                    callback.call(this, newData);
                } else {
                    var newName = newData['name'];
                    resourcesNames.push(newName);
                    resourcesNames = TUtils.sortArray(resourcesNames);
                    resources[newName] = newData['data'];
                    // preload image
                    self.preloadImage(newName);
                    callback.call(this, newName);
                }
            });
        };
        
        this.getResourceContent = function(name, callback) {
            return TLink.getResourceContent(name, resources[name].version, callback);
        };

        var updateEditedPrograms = function() {
            editedProgramsNames = Object.keys(editedPrograms);
            editedProgramsNames = TUtils.sortArray(editedProgramsNames);
            editedProgramsArray = [];
            for (var i = 0; i < editedProgramsNames.length; i++) {
                editedProgramsArray.push(editedPrograms[editedProgramsNames[i]]);
            }
        };
        
        this.preloadResources = function(progress, callback) {
            // TODO: handle preload of other resource types
            var graphicalResources = [];
            for (var name in resources) {
                var resource = resources[name];
                if (resource.type === "image") {
                    graphicalResources.push(this.getResourceLocation(name));
                }
            }
            var g = TRuntime.getGraphics();
            if (graphicalResources.length>0) {
                g.preload(graphicalResources, progress, callback);
            } else {
                callback.call(this);
            }
        };

    }

    return TProject;

});

