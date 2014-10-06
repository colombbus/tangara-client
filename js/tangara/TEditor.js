define(['jquery','ace/ace', 'ace/edit_session', 'ace/range', 'ace/undomanager', 'TProgram', 'TEnvironment', 'TLink', 'TUI'], function($,ace, ace_edit_session, ace_range, ace_undo_manager, TProgram, TEnvironment, TLink, TUI) {

    function TEditor() {
        var domEditor = document.createElement("div");
        domEditor.id = "teditor";
        var aceEditor;
        var codeChanged = false;
        var program;
        var AceEditSession = ace_edit_session.EditSession;
        var AceUndoManager = ace_undo_manager.UndoManager;
        var AceRange = ace_range.Range;
        var errorMarker = null;
        var disabled = false;
        var disabledSession = new AceEditSession('');
        var disabledMessage = document.createElement("div");
        disabledMessage.id =  "disabled-message";
        var disabledP = document.createElement("p");
        var disabledText = TEnvironment.getMessage("editor-disabled");
        disabledP.appendChild(document.createTextNode(disabledText));
        disabledMessage.appendChild(disabledP);

        this.getElement = function() {
            return domEditor;
        };
        
        this.displayed = function() {
            aceEditor = ace.edit(domEditor.id);
            aceEditor.setShowPrintMargin(false);
            //aceEditor.renderer.setShowGutter(false);
            aceEditor.setFontSize("20px");
            aceEditor.setHighlightActiveLine(false);
            aceEditor.setBehavioursEnabled(false);
            var self = this;
            aceEditor.on('input', function() {
                if (!program.isModified()) {
                    program.setModified(true);
                    window.unsavedFiles = true;
                    TUI.updateSidebarPrograms();
                }
                codeChanged = true;
                self.removeError();
            });
            aceEditor.commands.addCommand({
                name: "save",
                bindKey: {win: "Ctrl-S", mac: "Command-S"},
                exec: function(arg) {
                    TUI.saveProgram();
                }
            });
            
            // disable editor, waiting for a program to edit
            this.disable();
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
                program.setCode(this.getValue());
                codeChanged = false;
            }
            return program.getStatements();
        };
        
        this.getProgram = function() {
            return program;
        };

        this.setProgram = function(value) {
            program = value;
            codeChanged = true;
        };

        
        this.getProgramName = function() {
            return program.getName();
        };
        
        this.setSession = function(session) {
             if (disabled) {
                aceEditor.setReadOnly(false);
                aceEditor.renderer.setShowGutter(true);
                $(domEditor).removeClass('editor-disabled');
                domEditor.removeChild(disabledMessage);
                disabled = false;
                TUI.setSaveEnabled(true);                
             }
            aceEditor.setSession(session);
        };
        
        this.getSession = function() {
            return aceEditor.getSession();
        };

        this.reset = function() {
            var undo = aceEditor.getSession().getUndoManager();
            undo.reset();
            codeChanged = false;
        };
        
        this.giveFocus = function() {
            aceEditor.focus();
        };

        this.disable = function() {
            aceEditor.setSession(disabledSession);
            aceEditor.setReadOnly(true);
            aceEditor.renderer.setShowGutter(false);
            $(domEditor).addClass('editor-disabled');
            domEditor.appendChild(disabledMessage);
            TUI.setSaveEnabled(false);
            disabled = true;
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
        
        this.createSession = function(program) {
            var session = new AceEditSession(program.getCode());
            session.setMode("ace/mode/java");
            session.setUndoManager(new AceUndoManager());             
            return session;
        };
        
    };
    
    return TEditor;
});
