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
        
        // Regex
        //var 
        
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
            
            require(["ace/ext/language_tools"], function(langTools) {
                aceEditor.setOptions({
                    enableBasicAutocompletion: true,
                    enableSnippets: false
                });
                var commandCompleter = {
                    getCompletions: function(editor, session, pos, prefix, callback) {
                        var completions = [];
                        
                        completions.push(
                            { name: "tg1", value: "Tangara1", meta: "code1" },
                            { name: "tg2", value: "Tangara2", meta: "code1" },
                            { name: "tg3", value: "Tangara3", meta: "code1" },
                            { name: "tg4", value: "Tangara4", meta: "code1" }
                        );
                        callback(null, completions);
                    }
                };
                // Needs to clear completer in langTools here
                
                // add completion
                langTools.addCompleter(commandCompleter);
            });
            
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
            aceEditor.commands.addCommand({
                name: "methodHelper",
                bindKey: {win: '.',  mac: '.'},
                exec: function(editor) {
                    self.showMethodHelper();
                    return false; // let default event perform
                },
                readOnly: true // false if this command should not apply in readOnly mode
            });
            aceEditor.commands.addCommand({
                name: "methodHelper2",
                bindKey: {win: 'Backspace',  mac: 'Backspace'},
                exec: function(editor) {
                    // TODO :
                    return false;
                },
                readOnly: true // false if this command should not apply in readOnly mode
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
                TUI.setEditionEnabled(true);                
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
            TUI.setEditionEnabled(false);
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
        
        this.showMethodHelper = function() {
            var cursor = aceEditor.selection.getCursor();
            var token = aceEditor.getSession().getTokenAt(cursor.row, cursor.column-1);
            if (token.type = "identifier") {
                var name = token.value;
                var range = new AceRange(0,0,cursor.row, cursor.column);
                var valueBefore = aceEditor.getSession().getDocument().getTextRange(range);
            }
            console.log(test);
            console.debug(valueBefore);
        };
        
    };
    
    return TEditor;
});
