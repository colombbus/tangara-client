define(['ui/TComponent', 'TEnvironment', 'TUI', 'jquery'], function(TComponent, TEnvironment, TUI, $) {
    function TTextEditor(callback) {
        var $name, $textArea, $main;
        var appended = false;
        var resourceName = '';

        TComponent.call(this, "TTextEditor.html", function(component) {
            var $buttonClose = component.find(".tviewer-button-close");
            $buttonClose.prop("title", TEnvironment.getMessage("texteditor-close"));
            $buttonClose.click(function(e) {
                hide();
            });

            var $buttonCancel = component.find(".tviewer-creation-cancel");
            $buttonCancel.append(TEnvironment.getMessage("viewer-creation-cancel"));
            $buttonCancel.click(function(e) {
                hide();
            });

            var $buttonSave = component.find(".tviewer-creation-save");
            $buttonSave.append(TEnvironment.getMessage("viewer-creation-save"));
            $buttonSave.click(function(e) {
                save();
            });

            $main = component;
            $textArea = component.find("#ttexteditor-text");
            $name = component.find(".tviewer-text-name");

            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        this.loadText = function(name) {
            resourceName = name;
            $name.text(name);
            var src = TEnvironment.getProjectResource(name);
            $textArea.val('');
            $.get(src, null, function(data) {
                $textArea.val(data);
            }, "text");
            $main.fadeIn();
        };

        this.init = function() {
            $("body").append($main);
        };

        var hide = function() {
            $main.fadeOut();
        };

        var save = function() {
            TUI.setResourceContent(resourceName, $textArea.val());
            hide();
        };
    }

    TTextEditor.prototype = Object.create(TComponent.prototype);
    TTextEditor.prototype.constructor = TTextEditor;

    return TTextEditor;
});


