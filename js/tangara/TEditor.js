define(['jquery','ace/ace', 'ace/edit_session', 'ace/range', 'TProgram', 'TEnvironment'], function($,ace, ace_edit_session, ace_range, TProgram, TEnvironment) {

    function TEditor() {
        var domEditor = document.createElement("div");
        domEditor.id = "teditor";
        // start with editor hidden
        domEditor.style.display="none";
        
        var domEditorText = document.createElement("div");
        domEditorText.id = "teditor-text";
        domEditor.appendChild(domEditorText);

        
        var aceEditor;
        var dirty = false;
        var codeChanged = false;
        var programs = new Array();
        var sessions = new Array();
        var currentProgram = null;
        var newIndex = 1;
        var AceEditSession = ace_edit_session.EditSession;
        var AceRange = ace_range.Range;
        var errorMarker = null;

        this.getElement = function() {
            return domEditor;
        };
        
        this.displayed = function() {
            aceEditor = ace.edit(domEditorText.id);
            aceEditor.getSession().setMode("ace/mode/java");
            aceEditor.setShowPrintMargin(false);
            //aceEditor.renderer.setShowGutter(false);
            aceEditor.setFontSize("20px");
            aceEditor.setHighlightActiveLine(false);
            aceEditor.on('input', function() {
                codeChanged = true;
                if (errorMarker !== null) {
                    aceEditor.getSession().removeMarker(errorMarker);
                    errorMarker = null;
                }
                /*if (!aceEditor.getSession().getUndoManager().hasUndo())
                    dirty = false;
                else
                    dirty = true;*/
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
            if (name !== currentProgram.getName()) {
                if (typeof sessions[name] !== 'undefined') {
                    // program already opened
                    saveSession();
                    openSession(name);
                } else {
                    // program not already opened : we open it
                    this.openProgram(name);
                }
            }
        };
        
        function saveSession() {
            if (currentProgram !== null) {
                sessions[currentProgram.getName()] = aceEditor.getSession();
            }
        }
        
        function openSession(name) {
            aceEditor.setSession(sessions[name]);
            currentProgram = programs[name];
        }

        function createSession(name) {
            var program = new TProgram(name);
            programs.push(program);
            currentProgram = program;
            var session = new AceEditSession(program.getCode());
            sessions.push(session);
            aceEditor.setSession(session);
        }
        
        this.openProgram = function(name) {
            saveSession();
            createSession(name);
        };
        
        this.newProgram = function() {
            var name = TEnvironment.getMessage('program-new',newIndex);
            saveSession();
            createSession(name);
            newIndex++;
        };
        
        this.setError = function(lines) {
            if (lines.length > 1) {
                var range = new AceRange(lines[0]-1,0,lines[1]-1,100);
                errorMarker = aceEditor.getSession().addMarker(range, 'tangara_error', 'line', true);
            } else if (lines.length > 0) {
                var range = new AceRange(lines[0]-1,0,lines[0]-1,100);
                errorMarker = aceEditor.getSession().addMarker(range, 'tangara_error', 'line', true);
            }
        };
        
    };
    
    return TEditor;
});


