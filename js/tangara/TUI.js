define(['jquery', 'TRuntime', 'TEnvironment', 'quintus'], function($, TRuntime, TEnvironment, TError, Quintus) {
    var TUI = function() {
        var frame;
        var canvas;
        var editor;
        var sidebar;
        var toolbar;
        var console;
        var editorEnabled = false;
        var consoleDisplayed = true;
        var designModeEnabled = false;
        var minimized = false;
        var designLogDisplayed = false;
        var programsDisplayed = true;
        var log;

        this.setFrame = function(element) {
            frame = element;
            return;
        };

        this.setCanvas = function(element) {
            canvas = element;
            return;
        };

        this.setEditor = function(element) {
            editor = element;
            return;
        };

        this.setSidebar = function(element) {
            sidebar = element;
            return;
        };

        this.setLog = function(element) {
            log = element;
            return;
        };

        this.setToolbar = function(element) {
            toolbar = element;
            return;
        };

        this.setConsole = function(element) {
            console = element;
            return;
        };

        this.getCanvas = function() {
            return canvas;
        };

        this.hideConsole = function() {
            if (consoleDisplayed) {
                toolbar.disableConsole();
                log.saveScroll();
                console.hide();
                log.update();
                frame.lowerSeparator(console.getHeight());
                log.restoreScroll();
                consoleDisplayed = false;
            }
        };
        
        this.showConsole = function() {
            if (!consoleDisplayed) {
                toolbar.enableConsole();
                log.saveScroll();
                console.show();
                log.update();
                frame.raiseSeparator(console.getHeight());
                log.restoreScroll();
                consoleDisplayed = true;
            }
        };

        this.enableEditor = function() {
            if (!editorEnabled) {
                // hide console
                this.hideConsole();
                toolbar.enableEditor();
                TRuntime.stop();
                canvas.hide();
                editor.show();
                sidebar.show();
                editorEnabled = true;
            }
        };

        this.disableEditor = function() {
            if (editorEnabled) {
                toolbar.disableEditor();
                editor.hide();
                sidebar.hide();
                canvas.show();
                editorEnabled = false;
                // if not minimized, show console
                if (!minimized)
                    this.showConsole();
                TRuntime.start();
            }
        };

        this.toggleEditor = function() {
            if (editorEnabled) {
                this.disableEditor();
            } else {
                this.enableEditor();
            }
        };

        this.enableDesignMode = function() {
            if (!designModeEnabled) {
                TRuntime.freeze(true);
                canvas.setDesignMode(true);
                TRuntime.setDesignMode(true);
                toolbar.enableDesignMode();
                designModeEnabled = true;
                if (!designLogDisplayed) {
                    this.showDesignLog();
                }
            }
        };

        this.disableDesignMode = function() {
            if (designModeEnabled) {
                TRuntime.freeze(false);
                canvas.setDesignMode(false);
                TRuntime.setDesignMode(false);
                toolbar.disableDesignMode();
                designModeEnabled = false;
                designLogDisplayed = !log.hideDesignLogIfEmpty();
            }
        };

        this.toggleDesignMode = function() {
            if (designModeEnabled) {
                this.disableDesignMode();
            } else {
                this.enableDesignMode();
            }
        };
        
        this.showDesignLog = function() {
            log.showDesignLog();
            designLogDisplayed = true;
        };

        this.hideDesignLog = function() {
            log.hideDesignLog(!designModeEnabled);
            designLogDisplayed = false;
        };
        
        this.toggleDesignLog = function() {
            if (designLogDisplayed) {
                this.hideDesignLog();
            } else {
                this.showDesignLog();
            }
        };
        
        this.clear = function(confirm) {
            var goOn = true;
            if (typeof confirm !== 'undefined' && confirm) {
                goOn = window.confirm(TEnvironment.getMessage('clear-confirm'));
            }
            if (goOn) {
                TRuntime.clear();
                console.clear();
                this.clearLog();
            }
        };

        this.addLogMessage = function(text) {
            if (typeof log !== 'undefined') {
                log.addMessage(text);
            }
        };
        
        this.addLogError = function(error) {
            if (typeof log !== 'undefined') {
                log.addError(error);
            }
        };

        this.clearLog = function() {
            if (typeof log !== 'undefined') {
                log.clear();
            }
        };
        
        this.getPreviousRow = function() {
            if (typeof log !== 'undefined') {
                return log.getPreviousRow();
            }
        };

        this.getNextRow = function() {
            if (typeof log !== 'undefined') {
                return log.getNextRow();
            }
        };
        
        this.setLastRow = function() {
            if (typeof log !== 'undefined') {
                return log.setLastRow();
            }
        };

        this.execute = function() {
            if (designModeEnabled) {
                this.disableDesignMode();
            }
            if (designLogDisplayed) {
                this.hideDesignLog();
            }
            if (!editorEnabled) {
                // execution from console
                TRuntime.setCurrentProgramName(null);
                TRuntime.executeFrom(console);
                console.clear();
            } else if (editorEnabled) {
                // execution from editor
                this.clear(false);
                this.disableEditor();
                console.clear();
                TRuntime.setCurrentProgramName(editor.getProgramName());
                TRuntime.executeFrom(editor);
            }
        };
        
        this.handleError = function(index) {
            var error = log.getError(index);
            if (error.getProgramName() === null) {
                // error from command
                this.enableConsole();
                console.setValue(error.getCode());
                console.focus();
            } else {
                // error from program
                this.enableEditor();
                this.editProgram(error.getProgramName());
                editor.setError(error.getLines());
            }
        };
        
        this.saveProgram = function() {
            var project = TEnvironment.getProject();
            editor.updateProgram();
            var program = editor.getProgram();
            sidebar.showLoading(program.getName());
            try
            {
                project.saveProgram(program, editor.getSession());
                this.addLogMessage(TEnvironment.getMessage('program-saved', program.getName()));
                this.updateProgramInfo(program);
                editor.reset();
                // check if project is still dirty
                window.unsavedFiles = project.isUnsaved();
            } 
            catch(error) {
                this.addLogError(error);
            }
            sidebar.removeLoading(program.getName());
        };

        this.newProgram = function() {
            var project = TEnvironment.getProject();
            var program = project.createProgram();
            project.setSession(program, editor.createSession(program));
            editor.setProgram(program);
            editor.setSession(project.getSession(program));
            this.updateSidebarPrograms();
            sidebar.displayPrograms();
            editor.giveFocus();
        };

        this.editProgram = function(name) {
            try {
                var project = TEnvironment.getProject();
                // save previous session if any
                var previousProgram = editor.getProgram();
                if (typeof previousProgram !== 'undefined') {
                    project.updateSession(previousProgram,editor.getSession());
                }
                var newProgram;
                if (!project.isProgramEdited(name)) {
                    // Program has to be loaded
                    sidebar.showLoading(name);
                    project.editProgram(name);
                    newProgram = project.getEditedProgram(name);
                    project.setSession(newProgram, editor.createSession(newProgram));
                } else {
                    newProgram = project.getEditedProgram(name);
                }
                editor.setProgram(newProgram);
                editor.setSession(project.getSession(newProgram));
            } catch (error) {
                this.addLogError(error);
            }
            //update sidebar
            this.updateSidebarPrograms();
            editor.giveFocus();
        };

        function nextProgram(name) {
            var project = TEnvironment.getProject();
            var program = project.findPreviousEditedProgram(name);
            if (program) {
                editor.setProgram(program);
                editor.setSession(project.getSession(program));
                editor.giveFocus();
                // check if project is still dirty
                window.unsavedFiles = project.isUnsaved();
            } else {
                editor.disable();
                window.unsavedFiles = false;
            }
        }
        
        this.closeProgram = function(name) {
            var project = TEnvironment.getProject();
            var result = project.closeProgram(name);
            if (result) {
                // close performed
                // check if program was current editing program in editor, in which case we set next editing program as current program
                if (name === editor.getProgramName()) {
                    nextProgram(name);
                }
                // update sidebar
                this.updateSidebarPrograms();
            } else {
                // close cancelled
                editor.giveFocus();
            }
        };
        
        this.renameProgram = function(oldName, newName) {
            if (newName !== oldName) {
                var project = TEnvironment.getProject();
                try {
                    sidebar.showRenamingProgram(oldName);
                    project.renameProgram(oldName, newName);
                } catch(error) {
                    this.addLogError(error);
                }
            }
            this.updateSidebarPrograms();
        };

        this.renameResource = function(name, newBaseName) {
            var project = TEnvironment.getProject();
            var oldBaseName = project.getResourceBaseName(name);
            var newName = name;
            if (newBaseName !== oldBaseName) {
                try {
                    sidebar.showRenamingResource(name);
                    newName = project.renameResource(name, newBaseName);
                } catch(error) {
                    this.addLogError(error);
                }
            }
            this.updateSidebarResources();
            sidebar.selectResource(newName);
        };        
        
        this.setEditionEnabled = function(value) {
            if (value && TEnvironment.isUserLogged()) {
                toolbar.setEditionEnabled(true);                
            } else {
                toolbar.setEditionEnabled(false);
            }
        };
        
        this.updateSidebarPrograms = function() {
            sidebar.updatePrograms();
        };

        this.updateSidebarResources = function() {
            sidebar.updateResources();
        };
        
        this.updateProgramInfo = function(program) {
            sidebar.updateProgramInfo(program);
        };
        
        this.getCurrentProgram = function() {
            return editor.getProgram();
        };
        
        this.displayPrograms = function() {
            sidebar.displayPrograms();
            toolbar.enableProgramOptions();
            programsDisplayed = true;
        };

        this.displayResources = function() {
            if (sidebar.displayResources()) {
                toolbar.enableResourceOptions();
                programsDisplayed = false;
            }
        };
        
        this.delete = function() {
            var project = TEnvironment.getProject();
            if (programsDisplayed) {
                // Program deletion
                var name = editor.getProgramName();
                var goOn = window.confirm(TEnvironment.getMessage('delete-program-confirm', name));
                if (goOn) {
                    try {
                        project.deleteProgram(name);
                        nextProgram(name);
                    } catch(error) {
                        this.addLogError(error);
                    }
                }
                //update sidebar
                this.updateSidebarPrograms();
                editor.giveFocus();
            } else {
                // Resource deletion
                var name = sidebar.getCurrentResourceName();
                var goOn = window.confirm(TEnvironment.getMessage('delete-resource-confirm', name));
                if (goOn) {
                    try {
                        project.deleteResource(name);
                        nextProgram(name);
                    } catch(error) {
                        this.addLogError(error);
                    }
                }
                //update sidebar
                this.updateSidebarResources();
            }
        };
        
        this.recordObjectLocation = function(tObject, location) {
            var name = TRuntime.getTObjectName(tObject);
            log.addObjectLocation(name, location);
        };
        
        this.toggleMinimized = function() {
            if (!minimized) {
                // hide console
                this.hideConsole();
                log.saveScroll();
                log.hide();
                frame.lowerSeparator(log.getHeight());
                minimized = true;
            } else {
                log.show();
                frame.raiseSeparator(log.getHeight());
                log.restoreScroll();
                if (!editorEnabled) {
                    // show console
                    this.showConsole();
                }
                minimized = false;
            }
        };
        
        this.setResourceContent = function(name, data) {
            var newName = TEnvironment.getProject().setResourceContent(name, data);
            if (newName !== name) {
                // name has changed: update sidebar
                this.updateSidebarResources();
                sidebar.selectResource(newName);
            }
            return newName;
        };
        
        this.duplicateResource = function(name) {
            var newName = TEnvironment.getProject().duplicateResource(name);
            this.updateSidebarResources();
            sidebar.selectResource(newName);
            sidebar.viewResource(newName);
        };
        
        this.newResource = function() {
            sidebar.createResource();
        };

        this.createResource = function(name, width, height) {
            var newName = TEnvironment.getProject().createResource(name, width, height);
            this.updateSidebarResources();
            sidebar.selectResource(newName);
            sidebar.viewResource(newName);
        };

    };
    
    var uiInstance = new TUI();
    
    return uiInstance;

});

