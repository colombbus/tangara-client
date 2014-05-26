define(['TUI', 'TParser', 'TLog', 'jquery','ace/ace'], function(TUI, TParser, TLog, $,ace) {

    function TConsole() {
        var domConsole = document.createElement("div");
        domConsole.id = "tconsole";
        // start with console hidden
        domConsole.style.display="none";
        
        var domConsoleText = document.createElement("div");
        domConsoleText.id = "tconsole-text";
        // for iOS to show keyboard
        // TODO: add this only for iOS devices
        domConsoleText.setAttribute("contenteditable", "true");
        domConsole.appendChild(domConsoleText);

        var aceEditor;
        var currentCommand;
        var currentPosition;
        var computedHeight = -1;
        var browsingHistory = false;

        this.getElement = function() {
            return domConsole;
        };

        this.displayed = function() {
            aceEditor = ace.edit(domConsoleText.id);
            aceEditor.getSession().setMode("ace/mode/java");
            aceEditor.setShowPrintMargin(false);
            aceEditor.renderer.setShowGutter(false);
            aceEditor.setFontSize("20px");
            aceEditor.setHighlightActiveLine(false);

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
        };
        
        this.getValue = function() {
            return aceEditor.getSession().getValue();
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
        
    };

    return TConsole;
});
