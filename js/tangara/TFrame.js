define(['jquery', 'split-pane','TCanvas', 'TEnvironment', 'TEditor', 'TLog', 'Tessai'], function($, SplitPane, TCanvas, TEnvironment, TEditor, TLog, TAffiche) {
    function TFrame() {
        var domFrame = document.createElement("div");
        domFrame.id = "tframe";
        domFrame.className = "split-pane fixed-bottom";
        var topDiv = document.createElement("div");
        topDiv.id = "tframe-top";
        topDiv.className = "split-pane-component";
        // Add Canvas
        var canvas = new TCanvas();
        topDiv.appendChild(canvas.getElement());
        domFrame.appendChild(topDiv);
        
        var tess= new Tessai();
        
        var separator1 = document.createElement("div");
        separator1.id="tframe-separator";
        separator1.className="split-pane-divider";
        domFrame.appendChild(separator1);

        // Add Editor and Log
        var bottomDiv = document.createElement("div");
        bottomDiv.id = "tframe-bottom";
        bottomDiv.className = "split-pane-component";
        var bottomDivInner = document.createElement("div");
        bottomDivInner.id = "tframe-bottom-inner";
        bottomDivInner.className = "split-pane fixed-bottom";
        var editor = new TEditor();
        var editorElement = editor.getElement();
        editorElement.className = editorElement.className + " split-pane-component tframe-bottom-top";
        bottomDivInner.appendChild(editorElement);
        var separator2 = document.createElement("div");
        separator2.id = "tframe-bottom-divider";
        separator2.className="split-pane-divider";
        bottomDivInner.appendChild(separator2);
        var log = new TLog();
        var logElement = log.getElement();
        logElement.className = logElement.className + " split-pane-component tframe-bottom-bottom";
        bottomDivInner.appendChild(logElement);
        bottomDiv.appendChild(bottomDivInner);
        domFrame.appendChild(bottomDiv);

        // Set environment
        TEnvironment.setCanvas(canvas);
        TEnvironment.setLog(log);

        this.getElement = function() {
            return domFrame;
        };
        
        this.displayed = function() {
            canvas.displayed();
            editor.displayed();
            log.displayed();
            $('.split-pane').splitPane();
        };

    }
    
    return TFrame;
});
