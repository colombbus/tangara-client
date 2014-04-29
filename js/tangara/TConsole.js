define(['jquery','ace/ace', 'TEnvironment'], function($,ace,TEnvironment) {

    function TConsole() {
        var domConsole = document.createElement("div");
        domConsole.className = "tconsole";

        var domConsoleContainer = document.createElement("div");
        domConsoleContainer.className = "tconsole-inner";

        var domConsoleCellText = document.createElement("div");
        domConsoleCellText.className = "tconsole-text";

        var domConsoleCellButtons = document.createElement("div");
        domConsoleCellButtons.className = "tconsole-buttons";

        var domConsoleText = document.createElement("div");
        domConsoleText.id = "tconsole-text-"+TConsole.consoleId;
        domConsoleText.className = "tconsole-text-inner";

        // for iOS to show keyboard
        // TODO: add this only for iOS devices
        domConsoleText.setAttribute("contenteditable", "true");

        domConsoleCellText.appendChild(domConsoleText);
        domConsoleContainer.appendChild(domConsoleCellText);

        var buttonExecute = document.createElement("button");
        buttonExecute.className = "tconsole-button";
        var imageExecute = document.createElement("img");
        imageExecute.src = TEnvironment.getBaseUrl() + "/images/play.png";
        imageExecute.className = "tconsole-button-image";
        buttonExecute.appendChild(imageExecute);
        buttonExecute.appendChild(document.createTextNode(TEnvironment.getMessage('button-execute')));

        var buttonClear = document.createElement("button");
        buttonClear.className = "tconsole-button";
        var imageClear = document.createElement("img");
        imageClear.src = TEnvironment.getBaseUrl() + "/images/clear.png";
        imageClear.className = "tconsole-button-image";
        buttonClear.appendChild(imageClear);
        buttonClear.appendChild(document.createTextNode(TEnvironment.getMessage('button-clear')));

        domConsoleCellButtons.appendChild(buttonExecute);
        var separator = document.createElement("div");
        separator.className = "tconsole-button-separator";
        domConsoleCellButtons.appendChild(separator);
        domConsoleCellButtons.appendChild(buttonClear);

        domConsoleContainer.appendChild(domConsoleCellButtons);

        domConsole.appendChild(domConsoleContainer);

        TConsole.consoleId++;

        var aceEditor;

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
            aceEditor.focus();

            $(buttonExecute).click(function() {
                TEnvironment.execute(aceEditor.getSession().getValue());
                aceEditor.setValue("", -1);
            });

            $(buttonClear).click(function() {
                if (window.confirm(TEnvironment.getMessage('clear-confirm'))) {
                    TEnvironment.getCanvas().clear();
                    TEnvironment.clearLog();
                }
            });

            var totalCommands = 0;
            var history = 0;
            var archives_command=[];
            var commandlineNotEnded;
            var cursorPosition;

            aceEditor.commands.addCommand({
                name: 'executeCommand',
                bindKey: {win: 'Return',  mac: 'Return'},
                exec: function(editor) {
                    require(['TEnvironment'], function(TEnvironment) {
                        var commandline = aceEditor.getSession().getValue();
                        TEnvironment.execute(commandline);
                        editor.setValue("", -1);
                        if (commandline.length > 0){
                            archives_command.push($.trim(commandline));
                            totalCommands++;
                            history = totalCommands;
                            commandlineNotEnded ="";
                        }
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
    };

    TConsole.consoleId = 0;

    return TConsole;
});
