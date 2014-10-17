define(['TUI', 'TParser', 'TLog', 'TEnvironment', 'TUtils', 'TRuntime', 'jquery','ace/ace', 'ace/autocomplete', 'ace/range'], function(TUI, TParser, TLog, TEnvironment, TUtils, TRuntime, $,ace, ace_autocomplete, ace_range) {

    function TConsole() {
        var domConsole = document.createElement("div");
        domConsole.id = "tconsole";
        // start with console hidden
        domConsole.style.display="none";
        
        var domConsoleText = document.createElement("div");
        domConsoleText.id = "tconsole-text";
        // for iOS to show keyboard
        // TODO: add this only for iOS devices
        //domConsoleText.setAttribute("contenteditable", "true");
        domConsole.appendChild(domConsoleText);

        var AceRange = ace_range.Range;
        var AceAutocomplete = ace_autocomplete.Autocomplete;

        var aceEditor;
        var currentCommand;
        var currentPosition;
        var computedHeight = -1;
        var browsingHistory = false;
        
        var popupTriggered = false;
        var popupTimeout;
        var triggerPopup = false;

        this.getElement = function() {
            return domConsole;
        };

        this.displayed = function() {
            aceEditor = ace.edit(domConsoleText.id);
            aceEditor.getSession().setMode("ace/mode/javascript");
            // Disable JSHint
            aceEditor.getSession().setUseWorker(false);
            aceEditor.setShowPrintMargin(false);
            aceEditor.renderer.setShowGutter(false);
            aceEditor.setFontSize("20px");
            aceEditor.setHighlightActiveLine(false);

            aceEditor.on('input', function() {
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
                name: 'executeCommand',
                bindKey: {win: 'Return',  mac: 'Return'},
                exec: function(editor) {
                    TUI.execute();
                },
                readOnly: true // false if this command should not apply in readOnly mode
            });
            aceEditor.commands.addCommand({
                name: 'browseHistoryUp',
                bindKey: {win: 'Up',  mac: 'Up'},
                exec: function(editor) {
                    var history = TUI.getPreviousRow();
                    if (history !== null) {
                        if (!browsingHistory) {
                            currentCommand = editor.getValue();
                            currentPosition = editor.getCursorPosition();
                            browsingHistory = true;
                        }
                        editor.setValue(history);
                        editor.navigateLineEnd();
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
             });
            aceEditor.commands.addCommand({
                name: 'browsehistoryDown',
                bindKey: {win: 'Down',  mac: 'Down'},
                exec: function(editor) {
                    if (browsingHistory) {
                        var history = TUI.getNextRow();
                        if (history !== null) {
                            editor.setValue(history);
                            editor.navigateLineEnd();
                        } else {
                            // end of history reached
                            editor.setValue(currentCommand);
                            editor.navigateTo(currentPosition.row, currentPosition.column);
                            browsingHistory = false;
                        }
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
             });
            aceEditor.commands.addCommand({
                name: 'returnToCurrentCommand',
                bindKey: {win: 'Escape',  mac: 'Escape'},
                exec: function(editor) {
                    if (browsingHistory) {
                        editor.setValue(currentCommand);
                        editor.navigateTo(currentPosition.row, currentPosition.column);
                        TUI.setLastRow();
                        browsingHistory = false;
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
             });
             
            aceEditor.completers = [consoleCompleter];
            
            this.enableMethodHelper();
            
        };
        
        this.getValue = function() {
            return aceEditor.getSession().getValue();
        };
        
        this.setValue = function(value) {
            aceEditor.getSession().setValue(value);
            // set cursor to the end of line
            aceEditor.gotoPageDown();
        };
        
        this.focus = function() {
            aceEditor.focus();
        };
        
        this.getStatements = function() {
            return TParser.parse(this.getValue());
        };
        
        this.clear = function() {
            aceEditor.setValue("");
            browsingHistory = false;
        };
        
        this.show = function() {
            $(domConsole).show();
            aceEditor.focus();
        };
        
        this.hide = function() {
            $(domConsole).hide();
        };
        
        this.getHeight = function() {
            if (computedHeight === -1) {
                computedHeight = $(domConsole).outerHeight(false);
            }
            return computedHeight;
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

        var consoleCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                console.debug("entering console completer");
                pos.column--;
                var token = session.getTokenAt(pos.row, pos.column);

                if (token === null) {
                    console.debug("no token");
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
                    console.debug("token not identifier nor texte");
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
                    console.debug ("name empty");
                    return false;
                }

                var className = TRuntime.getTObjectClassName(name);
                var methods = TEnvironment.getClassMethods(className);
                var methodNames = Object.keys(methods);
                methodNames = TUtils.sortArray(methodNames);

                var completions = [];
                for (var i=0;i<methodNames.length;i++) {
                    completions.push({
                        caption: methodNames[i],
                        value: methods[methodNames[i]]
                    });
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

    return TConsole;
});
