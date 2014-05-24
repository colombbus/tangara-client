define(['jquery','ace/ace', 'TProgram'], function($,ace, TProgram) {

    function TEditor() {
        var domEditor = document.createElement("div");
        domEditor.id = "teditor";
        // start with editor hidden
        domEditor.style.display="none";
        
        var domEditorText = document.createElement("div");
        domEditorText.id = "teditor-text";
        domEditor.appendChild(domEditorText);

        
        var aceEditor;
        var programs = new Array();
        var currentProgram = new TProgram();
        currentProgram.setEditor(this);
        
        programs.push(currentProgram);
                
        function setDirty(value) {
            currentProgram.setDirty(value);
        }
               
        this.getElement = function() {
            return domEditor;
        };
        
        this.displayed = function() {
            aceEditor = ace.edit(domEditorText.id);
            aceEditor.getSession().setMode("ace/mode/java");
            aceEditor.setShowPrintMargin(false);
            //aceEditor.renderer.setShowGutter(false);
            aceEditor.setFontSize("20px");
            aceEditor.setHighlightActiveLine(false);
            aceEditor.on('input', function() {
                if (aceEditor.session.getUndoManager().isClean())
                    setDirty(false);
                else
                    setDirty(true);
            });
            /* NOTE FOR LATER
            $('#save').on("click", function() {
                editor.session.getUndoManager().markClean()
            })
            */
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
            return currentProgram.getStatements();
        };
        
    };
    
    return TEditor;
});


