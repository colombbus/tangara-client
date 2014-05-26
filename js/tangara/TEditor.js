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
        var dirty = false;
        var codeChanged = false;
        var programs = new Array();
        var currentProgram = new TProgram();
        
        programs.push(currentProgram);
                               
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
                codeChanged = true;
                if (aceEditor.session.getUndoManager().isClean())
                    dirty = false;
                else
                    dirty = true;
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
            if (codeChanged) {
                currentProgram.setCode(this.getValue());
                codeChanged = false;
            }
            return currentProgram.getStatements();
        };
        
    };
    
    return TEditor;
});


