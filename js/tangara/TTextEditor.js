define(['TEnvironment', 'TUI', 'jquery'], function(TEnvironment, TUI, $) {
    function TTextEditor() {
        var domMain = document.createElement("div");
        domMain.className= "tviewer-main";
        var domInner = document.createElement("div");
        domInner.className= "tviewer-text";
        var domName = document.createElement("div");
        domName.className = "tviewer-text-name";
        domInner.appendChild(domName);
        var domButtonSave = document.createElement("div");
        domButtonSave.className = "tviewer-button-save";
        domButtonSave.title = TEnvironment.getMessage("texteditor-save");
        domButtonSave.onclick = function() {
            save();
        };
        var domButtonClose = document.createElement("div");
        domButtonClose.className = "tviewer-button-close";
        domButtonClose.title = TEnvironment.getMessage("texteditor-close");
        domButtonClose.onclick = function() {
            hide();
        };
        domInner.appendChild(domButtonClose);
        var domText = document.createElement("div");
        domText.className = "tviewer-text-editor";

        var domTextArea = document.createElement("textarea");
        domTextArea.id = "ttexteditor-text";
        
        domText.appendChild(domTextArea);
        domInner.appendChild(domText);
        
        var buttonCancel = document.createElement("button");
        buttonCancel.className = "tviewer-creation-cancel tviewer-creation-button";
        buttonCancel.onclick = function() {
            hide();
        };
        var imageCancel = document.createElement("img");
        imageCancel.src = TEnvironment.getBaseUrl() + "/images/cancel.png";
        imageCancel.className = "ttoolbar-creation-button-image";
        buttonCancel.appendChild(imageCancel);
        buttonCancel.appendChild(document.createTextNode(TEnvironment.getMessage("viewer-creation-cancel")));
        var buttonSave = document.createElement("button");
        buttonSave.className = "tviewer-creation-save tviewer-creation-button";
        var imageSave = document.createElement("img");
        imageSave.src = TEnvironment.getBaseUrl() + "/images/ok.png";
        imageSave.className = "ttoolbar-creation-button-image";
        buttonSave.appendChild(imageSave);
        buttonSave.appendChild(document.createTextNode(TEnvironment.getMessage("viewer-creation-save")));
        buttonSave.onclick = function() {
            save();
        };
        
        var domButtons = document.createElement("div");
        domButtons.className = "tviewer-text-buttons";
        domButtons.appendChild(buttonCancel);
        domButtons.appendChild(buttonSave);
        
        domInner.appendChild(domButtons);

        domMain.appendChild(domInner);
        
        var $domTextArea = $(domTextArea);
        var $domName = $(domName);
        var appended = false;
        var resourceName = '';
        
        var $domMain = $(domMain);
        
        this.loadText = function(name) {
            resourceName = name;
            $domName.text(name);
            var src = TEnvironment.getProjectResource(name);
            $domTextArea.val('');
            $.get(src, null, function (data) {
                $domTextArea.val(data);
            }, "text");
            append();
        };
        
        var append = function() {
            if (!appended) {
                document.body.appendChild(domMain);
                $domMain.fadeIn();
                appended = true;
            }
        };
        
        var hide = function() {
            if (appended) {
                $domMain.fadeOut(function() {
                    document.body.removeChild(domMain);                    
                    appended = false;
                });
            }
        };
        
        var save = function() {
            TUI.setResourceContent(resourceName, $domTextArea.val());
            hide();
        };
    }

    return TTextEditor;

});


