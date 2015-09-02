define(['ui/TComponent', 'jquery', 'TEnvironment', 'TUI'], function(TComponent, $, TEnvironment, TUI) {
    function TToolbar(callback) {
        var $buttonExecute, $buttonEditor;
        var $optionDesignMode, $optionClear, $optionNewProgram, $optionSaveProgram, $optionNewResource, $optionDelete;
        var editorMode = false;
        var programOptions = true;

        var self = this;

        TComponent.call(this, "TToolbar.html", function(component) {
            $buttonExecute = component.find(".ttoolbar-button-execute");
            $buttonEditor = component.find(".ttoolbar-mode-editor");
            $optionDesignMode = component.find(".ttoolbar-option-design-mode");
            $optionClear = component.find(".ttoolbar-option-clear");
            $optionNewProgram = component.find(".ttoolbar-option-new-program");
            $optionSaveProgram = component.find(".ttoolbar-option-save");
            $optionNewResource = component.find(".ttoolbar-option-new-resource");
            $optionDelete = component.find(".ttoolbar-option-delete");

            var $buttonHelp = component.find("#ttoolbar-help");
            $buttonHelp.prop("title", TEnvironment.getMessage('button-help'));
            $buttonHelp.click(function(e) {
                $buttonHelp.toggleClass("active");
                parent.toggleHelp();
            })
            window.setHelpOpened = function() {
                $buttonHelp.addClass("active");
            };

            window.setHelpClosed = function() {
                $buttonHelp.removeClass("active");
            };

            $buttonEditor.append(TEnvironment.getMessage('mode-editor'));
            $buttonEditor.click(function(e) {
                TUI.toggleEditor();
            });
            
            // prevent double click from toggling console 
            $buttonEditor.dblclick(function(event){
                event.stopPropagation();
            });
            
            $buttonExecute.append(TEnvironment.getMessage('button-execute'));
            $buttonExecute.click(function(e) {
                TUI.execute();
            });
            // prevent double click from toggling console 
            $buttonExecute.dblclick(function(event){
                event.stopPropagation();
            });

            $optionClear.append(TEnvironment.getMessage('option-clear'));
            $optionClear.click(function(e) {
                TUI.clear(true);
            });
            // prevent double click from toggling console 
            $optionClear.dblclick(function(event){
                event.stopPropagation();
            });

            $optionDesignMode.append(TEnvironment.getMessage('option-design-mode'));
            $optionDesignMode.click(function(e) {
                TUI.toggleDesignMode();
            });
            // prevent double click from toggling console 
            $optionDesignMode.dblclick(function(event){
                event.stopPropagation();
            });
            
            $optionSaveProgram.append(TEnvironment.getMessage('option-save-program'));
            $optionSaveProgram.click(function(e) {
                TUI.saveProgram();
            });
            // prevent double click from toggling console 
            $optionSaveProgram.dblclick(function(event){
                event.stopPropagation();
            });
            
            $optionNewProgram.append(TEnvironment.getMessage('option-new-program'));
            $optionNewProgram.click(function(e) {
                TUI.newProgram();
            });
            // prevent double click from toggling console 
            $optionNewProgram.dblclick(function(event){
                event.stopPropagation();
            });
            
            $optionNewResource.append(TEnvironment.getMessage('option-new-resource'));
            $optionNewResource.click(function(e) {
                TUI.newResource();
            });
            // prevent double click from toggling console 
            $optionNewResource.dblclick(function(event){
                event.stopPropagation();
            });

            $optionDelete.append(TEnvironment.getMessage('option-delete'));
            $optionDelete.click(function(e) {
                TUI.delete();
            });
            // prevent double click from toggling console 
            $optionDelete.dblclick(function(event){
                event.stopPropagation();
            });


            // add double click handler for toggling log
            component.dblclick(function() {
                TUI.toggleMinimized();
            });
            // Prevent text selection
            component.mousedown(function() {
                return false;
            });

            // Start with editor mode disabled
            self.disableProgramOptions();
            self.disableResourceOptions();

            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        this.displayed = function() {
        };

        this.enableConsole = function() {
            $buttonExecute.show();
        };

        this.disableConsole = function() {
            $buttonExecute.hide();
        };

        this.enableDesignMode = function() {
            $optionDesignMode.addClass("active");
        };

        this.disableDesignMode = function() {
            $optionDesignMode.removeClass("active");
        };

        this.enableEditor = function() {
            if (!editorMode) {
                $buttonEditor.addClass("active");
                $optionClear.hide();
                $optionDesignMode.hide();
                $buttonExecute.show();
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
                $buttonEditor.removeClass("active");
                if (programOptions) {
                    this.disableProgramOptions();
                } else {
                    this.disableResourceOptions();
                }
                $optionClear.show();
                $optionDesignMode.show();
                $buttonExecute.hide();
                editorMode = false;
            }
        };

        this.enableProgramOptions = function() {
            this.disableResourceOptions();
            $optionNewProgram.show();
            $optionSaveProgram.show();
            $optionDelete.show();
            programOptions = true;
        };

        this.disableProgramOptions = function() {
            $optionNewProgram.hide();
            $optionSaveProgram.hide();
            $optionDelete.hide();
        };

        this.enableResourceOptions = function() {
            this.disableProgramOptions();
            $optionNewResource.show();
            $optionDelete.show();
            programOptions = false;
        };

        this.disableResourceOptions = function() {
            $optionNewResource.hide();
            $optionDelete.hide();
        };

        this.setEditionEnabled = function(value) {
            $optionSaveProgram.disabled = !value;
            $optionDelete.disabled = !value;
        };
    }
    ;

    TToolbar.prototype = Object.create(TComponent.prototype);
    TToolbar.prototype.constructor = TToolbar;

    return TToolbar;
});
