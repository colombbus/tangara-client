define(['jquery','ace/ace', 'TEnvironment'], function($,ace,TEnvironment) {

    function TConsole() {
        var domConsole = document.createElement("div");
        domConsole.id = "tconsole";
        // start with console hidden
        domConsole.style.display="hidden";
        
        var domConsoleText = document.createElement("div");
        domConsoleText.id = "tconsole-text";
        // for iOS to show keyboard
        // TODO: add this only for iOS devices
        domConsoleText.setAttribute("contenteditable", "true");
        domConsole.appendChild(domConsoleText);

        var aceEditor;
        var totalCommands = 0;
        var history = 0;
        var archives_command=[];
        var commandlineNotEnded;
        var cursorPosition;

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
                    require(['TEnvironment'], function(TEnvironment) {
                        TEnvironment.execute();
                    });
                },
                readOnly: true // false if this command should not apply in readOnly mode
             });
            aceEditor.commands.addCommand({
                name: 'browseHistoryUp',
                bindKey: {win: 'Up',  mac: 'Up'},
                exec: function(editor) {
                    var commandLine;
                    if (history === totalCommands) {
                        commandlineNotEnded = editor.getValue();
                        cursorPosition = editor.getCursorPositionScreen();
                    }
                    if (history > 0) {
                        history--;
                        commandLine = archives_command[history];
                        editor.setValue(commandLine);
                        editor.navigateLineEnd();
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
             });
            aceEditor.commands.addCommand({
                name: 'browsehistoryDown',
                bindKey: {win: 'Down',  mac: 'Down'},
                exec: function(editor) {
                    var commandLine;
                    if (history < totalCommands){
                        history++;
                        commandLine = archives_command[history];
                        editor.setValue(commandLine);
                        editor.navigateLineEnd();
                    }
                    if (history === totalCommands){
                        commandLine = commandlineNotEnded;
                        editor.setValue(commandLine);
                        editor.moveCursorToPosition(cursorPosition);
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
             });
            aceEditor.commands.addCommand({
                name: 'returnToCurrentCommand',
                bindKey: {win: 'Escape',  mac: 'Escape'},
                exec: function(editor) {
                    var currentLine = editor.getValue();
                    var commandLine;
                    if (history === totalCommands) {
                        if (commandlineNotEnded !== currentLine) {
                            commandLine = currentLine;
                            cursorPosition = editor.getCursorPositionScreen();
                        }
                    } else {
                        history = totalCommands;
                        commandLine = commandlineNotEnded;
                    }
                    editor.setValue(commandLine);
                    editor.moveCursorToPosition(cursorPosition);
                },
                readOnly: true // false if this command should not apply in readOnly mode
             });
        };
        
        this.addHistory = function(commandLine) {
            if (commandLine.length > 0){
                archives_command.push($.trim(commandLine));
                totalCommands++;
                history = totalCommands;
                commandlineNotEnded ="";
            }
        };
        
        this.getValue = function() {
            return aceEditor.getSession().getValue();
        };
        
        this.clear = function() {
            aceEditor.setValue("", -1);
        };
        
        this.show = function() {
            $(domConsole).show();
            aceEditor.focus();
        };
        
        this.hide = function() {
            $(domConsole).hide();
        };
    };

    return TConsole;
});
