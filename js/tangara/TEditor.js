define(['jquery','ace/ace', 'ace/edit_session', 'ace/range', 'ace/undomanager', 'ace/autocomplete', 'TProgram', 'TEnvironment', 'TLink', 'TUI', 'TUtils'], function($,ace, ace_edit_session, ace_range, ace_undo_manager, ace_autocomplete, TProgram, TEnvironment, TLink, TUI, TUtils) {

    function TEditor() {
        var domEditor = document.createElement("div");
        domEditor.id = "teditor";
        var aceEditor;
        var codeChanged = false;
        var program;
        var AceEditSession = ace_edit_session.EditSession;
        var AceUndoManager = ace_undo_manager.UndoManager;
        var AceRange = ace_range.Range;
        var AceAutocomplete = ace_autocomplete.Autocomplete;
        var errorMarker = null;
        var disabled = false;
        var disabledSession = new AceEditSession('');
        var disabledMessage = document.createElement("div");
        disabledMessage.id =  "disabled-message";
        var disabledP = document.createElement("p");
        var disabledText = TEnvironment.getMessage("editor-disabled");
        disabledP.appendChild(document.createTextNode(disabledText));
        disabledMessage.appendChild(disabledP);
        
        var popupTriggered = false;
        var popupTimeout;
        var triggerPopup = false;
        var editionEnabled = false;
        
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
                if (!program.isModified()&&editionEnabled) {
                    program.setModified(true);
                    TUI.updateSidebarPrograms();
                }
                codeChanged = true;
                self.removeError();
                if (triggerPopup) {
                    triggerPopup = false;
                    popupTimeout = setTimeout(function() {
                        popupTriggered = false;
                        AceAutocomplete.startCommand.exec(aceEditor);
                    }, 800);
                    popupTriggered = true;
                } else if (popupTriggered) {
                    clearTimeout(popupTimeout);
                    popupTriggered = false;
                }
            });
            aceEditor.commands.addCommand({
                name: "save",
                bindKey: {win: "Ctrl-S", mac: "Command-S"},
                exec: function(arg) {
                    if (editionEnabled) {
                        TUI.saveProgram();
                    }
                }
            });

            aceEditor.completers = [editorCompleter];
            
            this.enableMethodHelper();
            
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
            this.updateProgram();
            return program.getStatements();
        };
        
        this.updateProgram = function() {
            if (codeChanged) {
                program.setCode(this.getValue());
                codeChanged = false;
            }
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
            session.setMode("ace/mode/javascript");
            session.setUndoManager(new AceUndoManager());
            // Disable JSHint
            session.setUseWorker(false);
            return session;
        };
        
        this.enableMethodHelper = function() {
            aceEditor.commands.addCommand(dotCommand);
            aceEditor.commands.addCommand(backspaceCommand);
            aceEditor.commands.addCommand(AceAutocomplete.startCommand);
        };

        this.disableMethodHelper = function() {
            aceEditor.commands.removeCommand(dotCommand);
            aceEditor.commands.removeCommand(backspaceCommand);
            aceEditor.commands.removeCommand(AceAutocomplete.startCommand);
        };
        
        this.setEditionEnabled = function(value) {
            editionEnabled = value;
        };

        var editorCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                pos.column--;
                var token = session.getTokenAt(pos.row, pos.column);
                var endToken = "(";

                if (token === null) {
                    return false;
                }

                var tokens = session.getTokens(pos.row);
                var index = token.index;

                // TODO: see if we can handle this situation in js
                /*if (token.type === "rparen") {
                    // Right parenthesis: try to find actual identifier
                    while (index >0 & token.type !== "identifier") {
                        index--;
                        token = tokens[index];
                    }
                    endToken = "[";
                }*/

                if (token.type !== "identifier" &&  token.type !== "text") {
                    return false;
                }

                var name = token.value.trim();

                for (var i = index-1;i>=0;i--) {
                    token = tokens[i];
                    if (token.type !== "identifier" &&  token.type !== "text") {
                        break;
                    }
                    var part = token.value.trim();
                    if (part.length === 0) {
                        break;
                    }

                    name = part+name;
                }

                if (name.length === 0) {
                    return false;
                }

                var range = new AceRange(0,0,pos.row, pos.column);
                var valueBefore = session.getDocument().getTextRange(range);
                // Since regex do not support unicode...
                var unicodeName = TUtils.toUnicode(name);
                var regex = new RegExp("(?:^|\\s)"+unicodeName+"\\s*=\\s*new\\s*([\\S^\\"+endToken+"]*)\\s*\\"+endToken);

                var result = regex.exec(valueBefore);

                var completions = [];

                if (result !== null && result.length>0) {
                    var className = result[1];
                    var methods = TEnvironment.getTranslatedClassMethods(className);
                    var methodNames = Object.keys(methods);
                    methodNames = TUtils.sortArray(methodNames);
                    for (var i=0;i<methodNames.length;i++) {
                        completions.push({
                            caption: methodNames[i],
                            value: methods[methodNames[i]]
                        });
                    }
                }
                callback(null, completions);
            }
        };
        
        var dotCommand = {
            name: "methodHelper",
            bindKey: {win: '.',  mac: '.'},
            exec: function(editor) {
                triggerPopup = true;;
                return false; // let default event perform
            },
            readOnly: true // false if this command should not apply in readOnly mode
        };
        
        var backspaceCommand = {
            name: "methodHelper2",
            bindKey: {win: 'Backspace',  mac: 'Backspace'},
            exec: function(editor) {
                var cursor = editor.selection.getCursor();
                var token = editor.getSession().getTokenAt(cursor.row, cursor.column-1);
                if (token !== null && token.type === "punctuation.operator" && token.value === ".") {
                    triggerPopup = true;
                }
                return false;
            },
            readOnly: true // false if this command should not apply in readOnly mode
        };
        
    };
    
    return TEditor;
});
