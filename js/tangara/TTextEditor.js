define(['TEnvironment', 'jquery'], function(TEnvironment, $) {
    function TTextEditor() {
        var domMain = document.createElement("div");
        domMain.className= "tviewer-main loading";
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
        domMain.appendChild(domButtonClose);
        var domText = document.createElement("textarea");
        domText.id = "ttexteditor-text";
        domText.className = "tviewer-text-editor";
        
        var $domText = $(domText);
        domMain.appendChild(domText);
        var appended = false;
        
        var $domMain = $(domMain);
        
        this.loadText = function(name) {
            append();
            var src = TEnvironment.getProjectResource(name);
            $domText.load(src);
        };
        
        var append = function() {
            if (!appended) {
                document.body.appendChild(domMain);
                appended = true;
            }
        };
        
        var hide = function() {
            if (appended) {
                $domMain.fadeOut();
                document.body.removeChild(domMain);
                appended = false;
            }
        };
    }

    return TTextEditor;

});


