define(['TLink', 'TProgram', 'TEnvironment', 'TUtils', 'TError'], function(TLink, TProgram, TEnvironment, TUtils, TError) {
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
        };

        this.getId = function() {
            return id;
        };

        this.renameProgram = function(oldName, newName) {
            if (typeof editedPrograms[oldName] !== 'undefined') {
                var program = editedPrograms[oldName];
                program.rename(newName);

                // add newname records
                programs.push(newName);
                sessions[newName] = sessions[oldName];
                editedPrograms[newName] = editedPrograms[oldName];
                
                // remove oldname records
                var i = programs.indexOf(oldName);
                if (i>-1) {
                    // Should always be the case
                    programs.splice(i,1);
                }
                delete sessions[oldName];
                delete editedPrograms[oldName];

                // update programs lists
                programs = TUtils.sortArray(programs);
                updateEditedPrograms();
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
        
        this.saveProgram = function(program, session) {
            if (typeof(session) !== 'undefined') {
                this.updateSession(program,session);
            }
            program.save();
        };
        
        this.getEditedProgram = function(name) {
            if (typeof editedPrograms[name] !== 'undefined') {
                return editedPrograms[name];
            }
            return false;
        };
              
        this.editProgram = function(name, session) {
            if (typeof editedPrograms[name] === 'undefined') {
                var program = new TProgram(name);
                editedPrograms[name] = program;
                // sort editing programs alphabetically
                updateEditedPrograms();
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
                if (i>-1) {
                    // Should always be the case
                    programs.splice(i,1);
                }
            }
            return true;
        };
        
        this.findPreviousEditedProgram = function(name) {
            if (editedProgramsNames.length === 0 ) {
                return false;
            }
            var value = editedProgramsNames[0];
            name = name.toLowerCase();
            for (var i=1;i<editedProgramsNames.length;i++) {
                if (name.localeCompare(editedProgramsNames[i].toLowerCase())>0) {
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
        
        this.update = function() {
            programs = [];
            resources = {};
            resourcesNames = [];
            try {
                programs = TLink.getProgramList();
                resources = TLink.getResources();
                resourcesNames = Object.keys(resources);
                // sort programs and resources alphabetically
                programs = TUtils.sortArray(programs);
                resourcesNames = TUtils.sortArray(resourcesNames);
                TEnvironment.setUserLogged(true);
                this.preloadImages();
            }
            catch (error) {
                TEnvironment.setUserLogged(false);
            }
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
                var e = new TError(TEnvironment.getMessage("resource-unknown",name));
                throw e;
            }
        };
        
        this.getNewResourceIndex = function(name) {
            var i;
            for (i=0; i< resourcesNames.length; i++) {
                var current = resourcesNames[i];
                var result = current.toLowerCase().localeCompare(name.toLowerCase());
                if (result === 0) {
                    // problem: resource name already exists
                    var e = new TError(TEnvironment.getMessage("resource-name-exists",name));
                    throw e;
                }
                if (result > 0) {
                    break;
                }
            }
            return i;
        };
        
        this.uploadingResource = function(name) {
            if (typeof(resources[name]) !== 'undefined') {
                var e = new TError(TEnvironment.getMessage("resource-already-exists",name));
                throw e;
            }
            resources[name] = {'type':'uploading'};
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
            if (typeof(resources[name] !== 'undefined')) {
                resources[name] = undefined;
            }
            var i = resourcesNames.indexOf(name);
            if (i > -1) {
                resourcesNames.splice(i, 1);
            }
        };

        this.renameResource = function(name, newBaseName) {
            var i = resourcesNames.indexOf(name);
            newName = name;
            if (i > -1) {
                // resource exists
                var resource = resources[name];
                // check that resource is not uploading
                var type = resource.type;
                if (type === 'uploading') {
                    throw new TError(TEnvironment.getMessage('resource-not-uploaded'));
                }
                var newName = TLink.renameResource(name, newBaseName);
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
                    this.preloadImage(newName);
                }
            }
            return newName;
        };
        
        this.setResourceContent = function(name, data) {
            var newData = TLink.setResourceContent(name, data);
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
            this.preloadImage(name);
            return name;
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
            for (var i=0; i<resourcesNames.length; i++) {
                var name = resourcesNames[i];
                if (resources[name].type === 'image') {
                    this.preloadImage(name);
                }
            }
        };
        
        this.isUnsaved = function() {
            for (var i =0; i<editedPrograms.length; i++) {
                var program = editedPrograms[i];
                if (program.isModified()) {
                    return true;
                }
            }
            return false;
        };
        
        this.deleteProgram = function(name) {
            if (typeof editedPrograms[name] !== 'undefined') {
                var program = editedPrograms[name];
                program.delete();

                // delete corresponding records
                var i = programs.indexOf(name);
                if (i>-1) {
                    // Should always be the case
                    programs.splice(i,1);
                }
                delete sessions[name];
                delete editedPrograms[name];

                // update programs lists
                updateEditedPrograms();
            }
        };
        
        this.deleteResource = function(name) {
            var i = resourcesNames.indexOf(name);
            if (i > -1) {
                // resource exists
                var resource = resources[name];
                // check that resource is not uploading
                var type = resource.type;
                if (type === 'uploading') {
                    //TODO: find a way to cancel upload?
                    throw new TError(TEnvironment.getMessage('resource-not-uploaded'));
                }
                TLink.deleteResource(name);
                // remove name
                resourcesNames.splice(i, 1);
                delete resources[name];
            }
        };
        
        this.duplicateResource = function(name) {
            var newData = TLink.duplicateResource(name);
            var newName = newData['name'];
            resourcesNames.push(newName);
            resourcesNames = TUtils.sortArray(resourcesNames);
            resources[newName] = newData['data'];
            // preload image
            this.preloadImage(newName);
            return newName;
        };
        
        function updateEditedPrograms() {
            editedProgramsNames = Object.keys(editedPrograms);
            editedProgramsNames = TUtils.sortArray(editedProgramsNames);
            editedProgramsArray = [];
            for (var i=0; i<editedProgramsNames.length ;i++)
            {
                editedProgramsArray.push(editedPrograms[editedProgramsNames[i]]);
            }
        }
        
    }
    
    return TProject;

});

