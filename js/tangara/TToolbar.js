define(['jquery','TEnvironment', 'TUI'], function($,TEnvironment, TUI) {
    function TToolbar() {
        var domToolbar = document.createElement("div");
        domToolbar.id = "ttoolbar";

        // MODES
        var domModes = document.createElement("div");
        domModes.className = "ttoolbar-modes";
        
        var domConsole = document.createElement("button");
        var imageConsole = document.createElement("img");
        imageConsole.src = TEnvironment.getBaseUrl() + "/images/console.png";
        imageConsole.className = "ttoolbar-mode-image";
        domConsole.appendChild(imageConsole);
        domConsole.appendChild(document.createTextNode(TEnvironment.getMessage('mode-console')));
        domConsole.className = "ttoolbar-mode";
        domConsole.onclick = function() { TUI.toggleConsole(); };
        var domEditor = document.createElement("button");
        var imageEditor = document.createElement("img");
        imageEditor.src = TEnvironment.getBaseUrl() + "/images/editor.png";
        imageEditor.className = "ttoolbar-mode-image";
        domEditor.appendChild(imageEditor);
        domEditor.appendChild(document.createTextNode(TEnvironment.getMessage('mode-editor')));
        domEditor.className = "ttoolbar-mode";
        domEditor.onclick = function() { TUI.toggleEditor(); };
        domModes.appendChild(domConsole);
        domModes.appendChild(domEditor);
        domToolbar.appendChild(domModes);
        
        // BUTTONS
        var domButtons = document.createElement("div");
        domButtons.className = "ttoolbar-buttons";
        domToolbar.appendChild(domButtons);
        
        // Create buttons
        var buttonExecute = document.createElement("button");
        buttonExecute.className = "ttoolbar-button ttoolbar-button-execute";
        var imageExecute = document.createElement("img");
        imageExecute.src = TEnvironment.getBaseUrl() + "/images/play.png";
        imageExecute.className = "ttoolbar-button-image";
        buttonExecute.appendChild(imageExecute);
        buttonExecute.appendChild(document.createTextNode(TEnvironment.getMessage('button-execute')));
        buttonExecute.onclick = function() { TUI.execute(); };

        // OPTIONS
        var domOptions = document.createElement("div");
        domOptions.className = "ttoolbar-options";
        domToolbar.appendChild(domOptions);
        
        // Create options
        var optionClear = document.createElement("button");
        optionClear.className = "ttoolbar-option";
        var imageClear = document.createElement("img");
        imageClear.src = TEnvironment.getBaseUrl() + "/images/clear.png";
        imageClear.className = "ttoolbar-option-image";
        optionClear.appendChild(imageClear);
        optionClear.appendChild(document.createTextNode(TEnvironment.getMessage('option-clear')));
        optionClear.onclick = function() { TUI.clear(true); };

        var optionDesignMode = document.createElement("button");
        optionDesignMode.className = "ttoolbar-option";
        var imageDesignMode = document.createElement("img");
        imageDesignMode.src = TEnvironment.getBaseUrl() + "/images/design_mode.png";
        imageDesignMode.className = "ttoolbar-option-image";
        optionDesignMode.appendChild(imageDesignMode);
        optionDesignMode.appendChild(document.createTextNode(TEnvironment.getMessage('option-design-mode')));
        optionDesignMode.onclick = function() { TUI.toggleDesignMode(); };

        var optionSaveProgram = document.createElement("button");
        optionSaveProgram.className = "ttoolbar-option";
        var imageSaveProgram = document.createElement("img");
        imageSaveProgram.src = TEnvironment.getBaseUrl() + "/images/save.png";
        imageSaveProgram.className = "ttoolbar-option-image";
        optionSaveProgram.appendChild(imageSaveProgram);
        optionSaveProgram.appendChild(document.createTextNode(TEnvironment.getMessage('option-save-program')));
        optionSaveProgram.onclick = function() { TUI.saveProgram(); };

        var optionNewProgram = document.createElement("button");
        optionNewProgram.className = "ttoolbar-option";
        var imageNewProgram = document.createElement("img");
        imageNewProgram.src = TEnvironment.getBaseUrl() + "/images/new.png";
        imageNewProgram.className = "ttoolbar-option-image";
        optionNewProgram.appendChild(imageNewProgram);
        optionNewProgram.appendChild(document.createTextNode(TEnvironment.getMessage('option-new-program')));
        optionNewProgram.onclick = function() { TUI.newProgram(); };

        var optionDelete = document.createElement("button");
        optionDelete.className = "ttoolbar-option";
        var imageDelete = document.createElement("img");
        imageDelete.src = TEnvironment.getBaseUrl() + "/images/delete.png";
        imageDelete.className = "ttoolbar-option-image";
        optionDelete.appendChild(imageDelete);
        optionDelete.appendChild(document.createTextNode(TEnvironment.getMessage('option-delete')));
        optionDelete.onclick = function() { TUI.delete(); };

        // Start with editor mode disabled
        domOptions.appendChild(optionClear);
        domOptions.appendChild(optionDesignMode);
        
        // add double click handler for toggling log
        var $domToolbar = $(domToolbar);
        $domToolbar.dblclick(function() {
            TUI.toggleLog();
        });
        // Prevent text selection
        $domToolbar.mousedown(function(){return false;});
        
        var editorMode = false;
        var programOptions = true;


        this.getElement = function() {
            return domToolbar;
        };
        
        this.displayed = function() {
        };
        
        this.enableConsole = function() {
            domConsole.className = "ttoolbar-mode active";
            domButtons.appendChild(buttonExecute);
        };
        
        this.disableConsole = function() {
            domConsole.className = "ttoolbar-mode";
            domButtons.removeChild(buttonExecute);
        };
        
        this.enableDesignMode = function() {
            optionDesignMode.className = "ttoolbar-option active";
        };

        this.disableDesignMode = function() {
            optionDesignMode.className = "ttoolbar-option";
        };

        this.enableEditor = function() {
            if (!editorMode) {
                domEditor.className = "ttoolbar-mode active";
                domOptions.removeChild(optionClear);
                domOptions.removeChild(optionDesignMode);            
                domButtons.appendChild(buttonExecute);
                editorMode = true;
                if (programOptions) {
                    this.enableProgramOptions();
                } else {
                    this.enableResourceOptions();
                }
            }
        };
        
        this.disableEditor = function() {
            if (editorMode) {
                domEditor.className = "ttoolbar-mode";
                if (programOptions) {
                    this.disableProgramOptions();
                } else {
                    this.disableResourceOptions();
                }
                domOptions.appendChild(optionClear);
                domOptions.appendChild(optionDesignMode);
                domButtons.removeChild(buttonExecute);
                editorMode = false;
            }
        };

        this.enableProgramOptions = function() {
            this.disableResourceOptions();
            if (!$.contains(domOptions, optionNewProgram)) {
                domOptions.appendChild(optionNewProgram);
            }
            if (!$.contains(domOptions, optionSaveProgram)) {
                domOptions.appendChild(optionSaveProgram);
            }
            if (!$.contains(domOptions, optionDelete)) {
                domOptions.appendChild(optionDelete);
            }
            programOptions = true;
        };

        this.disableProgramOptions = function() {
            if ($.contains(domOptions, optionNewProgram)) {
                domOptions.removeChild(optionNewProgram);
            }
            if ($.contains(domOptions, optionSaveProgram)) {
                domOptions.removeChild(optionSaveProgram);
            }
            if ($.contains(domOptions, optionDelete)) {
                domOptions.removeChild(optionDelete);
            }
        };

        this.enableResourceOptions = function(force) {
            this.disableProgramOptions();;
            if (!$.contains(domOptions, optionDelete)) {
                domOptions.appendChild(optionDelete);
            }
            programOptions = false;
        };

        this.disableResourceOptions = function() {
            if ($.contains(domOptions, optionDelete)) {
                domOptions.removeChild(optionDelete);
            }
        };
        
        this.setEditionEnabled = function(value) {
            optionSaveProgram.disabled = !value;
            optionDelete.disabled = !value;
        };
    };
    return TToolbar;
});
