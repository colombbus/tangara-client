define(['jquery','ace/ace', 'ace/edit_session', 'ace/range', 'TProgram', 'TEnvironment', 'TLink'], function($,ace, ace_edit_session, ace_range, TProgram, TEnvironment, TLink) {

    function TEditor() {
        var domEditor = document.createElement("div");
        domEditor.id = "teditor";
        // start with editor hidden
        domEditor.style.display="none";
        
        var domEditorSidebar = document.createElement("div");
        domEditorSidebar.id = "teditor-sidebar";
        domEditor.appendChild(domEditorSidebar);
        
        var domEditorText = document.createElement("div");
        domEditorText.id = "teditor-text";
        domEditor.appendChild(domEditorText);

        
        var aceEditor;
        var codeChanged = false;
        var editing = new Array();
        var currentProgram = null;
        var AceEditSession = ace_edit_session.EditSession;
        var AceRange = ace_range.Range;
        var errorMarker = null;

        this.getElement = function() {
            return domEditor;
        };
        
        this.displayed = function() {
            aceEditor = ace.edit(domEditorText.id);
            aceEditor.setShowPrintMargin(false);
            //aceEditor.renderer.setShowGutter(false);
            aceEditor.setFontSize("20px");
            aceEditor.setHighlightActiveLine(false);
            var self = this;
            aceEditor.on('input', function() {
                if (!currentProgram.isModified()) {
                    currentProgram.setModified(true);
                    self.updateProgramName();
                }
                codeChanged = true;
                self.removeError();
                /*if (!aceEditor.getSession().getUndoManager().hasUndo())
                    dirty = false;
                else
                    dirty = true;*/
            });
            aceEditor.commands.addCommand({
                name: "save",
                bindKey: {win: "Ctrl-S", mac: "Command-S"},
                exec: function(arg) {
                    self.saveProgram();
                }
            });
            
            this.newProgram();
            /* NOTE FOR LATER
            $('#save').on("click", function() {
                editor.session.getUndoManager().markClean()
            })
            */
        };
        
        this.show = function() {
            $(domEditor).show();
            aceEditor.focus();
        };
        
        this.hide = function() {
            $(domEditor).hide();
        };
        
        this.getValue = function() {
            return aceEditor.getSession().getValue();
        };
        
        this.getStatements = function() {
            if (codeChanged) {
                currentProgram.setCode(this.getValue());
                codeChanged = false;
            }
            return currentProgram.getStatements();
        };
        
        this.getCurrentProgramName = function() {
            return currentProgram.getName();
        };
        
        this.editProgram = function(name) {
            if (currentProgram === null || name !== currentProgram.getName()) {
                if (typeof editing[name] !== 'undefined') {
                    // program already opened
                    saveSession();
                    openSession(name);
                    this.updateSidebar();
                } else {
                    // program not already opened : we open it
                    this.openProgram(name);
                    this.updateSidebar();
                }
            }
            aceEditor.focus();            
        };
        
        function saveSession() {
            if (currentProgram !== null) {
                editing[currentProgram.getName()]['session'] = aceEditor.getSession();
                currentProgram.setCode(aceEditor.getSession().getValue());
                codeChanged = false;
            }
        }
        
        function openSession(name) {
            aceEditor.setSession(editing[name]['session']);
            currentProgram = editing[name]['program'];
        }

        function createSession(program) {
            var session = new AceEditSession(program.getCode());
            session.setMode("ace/mode/java");
            editing[program.getName()]['session'] = session;
            aceEditor.setSession(session);
        }
        
        this.openProgram = function(name) {
            saveSession();
            var program = new TProgram(name);
            currentProgram = program;
            editing[name] = new Array();
            editing[name]['program'] = program;
            createSession(program);
        };
        
        this.newProgram = function() {
            saveSession();
            var program = new TProgram();
            editing[program.getName()] = new Array();
            editing[program.getName()]['program'] = program;
            currentProgram = program;
            createSession(program);
            this.updateSidebar();
            aceEditor.focus();
        };
        
        this.closeProgram = function(name) {
            var editedPrograms = Object.keys(editing);
            editedPrograms = sortArray(editedPrograms);
            var deletedIndex = editedPrograms.indexOf(name);
            if (currentProgram.isModified()) {
                var goOn = window.confirm(TEnvironment.getMessage('close-confirm', name));
                if (!goOn) {
                    aceEditor.focus();
                    return;
                }
            }
            delete editing[name];
            currentProgram = null;
            // Find program to display
            if (deletedIndex > 0) {
                this.editProgram(editedPrograms[deletedIndex-1]);
            } else if (editedPrograms.length>1) {
                // deleted was first: display following
                this.editProgram(editedPrograms[1]);
            } else {
                // there are no more edited program: create one
                this.newProgram();
            }
            aceEditor.focus();
        };
        
        this.saveProgram = function() {
            saveSession();
            currentProgram.save();
            this.updateProgramName();
        };
        
        this.removeError = function() {
            if (errorMarker !== null) {
                aceEditor.getSession().removeMarker(errorMarker);
                errorMarker = null;
            }
        };
        
        this.setError = function(lines) {
            this.removeError();
            if (lines.length > 1) {
                var range = new AceRange(lines[0]-1,0,lines[1]-1,100);
                errorMarker = aceEditor.getSession().addMarker(range, 'tangara_error', 'line', true);
            } else if (lines.length > 0) {
                var range = new AceRange(lines[0]-1,0,lines[0]-1,100);
                errorMarker = aceEditor.getSession().addMarker(range, 'tangara_error', 'line', true);
            }
            aceEditor.navigateTo(lines[0]-1, 0);
            // In a timer, because otherwise does not seem to work when editor mode has just been activated
            setTimeout(function() { aceEditor.scrollToLine(lines[0]-1, true, true, null); }, 100);
        };
        
        this.updateSidebar = function() {
            var programList = TLink.getProgramList();
            var editedPrograms = Object.keys(editing);
            
            // Sort programs alphabetically
            programList = sortArray(programList);
            editedPrograms = sortArray(editedPrograms);
            
            domEditorSidebar.innerHTML = "";


            function addElement(editor, name, displayedName, edited, current) {
                var element = document.createElement("div");
                element.className = "teditor-sidebar-program";
                if (edited) {
                    element.className += " teditor-sidebar-edited";
                }
                if (typeof current !== 'undefined' && current) {
                    element.className += " teditor-sidebar-current";
                }
                element.onclick = function() { editor.editProgram(name);};
                var nameElement = document.createElement("div");
                nameElement.id = "teditor-sidebar-program-"+TProgram.findId(name);
                nameElement.appendChild(document.createTextNode(displayedName));
                element.appendChild(nameElement);
                if (edited) {
                    var closeElement = document.createElement("div");
                    closeElement.className = "teditor-sidebar-close";
                    closeElement.onclick = function(e) { editor.closeProgram(name);e.stopPropagation();};
                    element.appendChild(closeElement);
                }
                domEditorSidebar.appendChild(element);
            }

            var currentName = "";
            
            if (typeof currentProgram !== 'undefined') {
                currentName = currentProgram.getName();
            }

            for (var i=0; i<editedPrograms.length;i++) {
                addElement(this, editedPrograms[i], editing[editedPrograms[i]]['program'].getDisplayedName(), true, editedPrograms[i] === currentName);
            }
            
            for (var i=0; i<programList.length;i++) {
                var name = programList[i];
                if (typeof editing[name] === 'undefined') {
                    addElement(this, name, name, false);
                }
            }
        };
        
        function sortArray(value) {
            return value.sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase());});
        }
        
        this.updateProgramName = function() {
            var id = "#teditor-sidebar-program-"+currentProgram.getId();
            $(id).text(currentProgram.getDisplayedName());
        };
        
    };
    
    return TEditor;
});


