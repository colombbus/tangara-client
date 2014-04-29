define(['jquery', 'split-pane','TCanvas', 'TEnvironment', 'TConsole', 'TLog'], function($, SplitPane, TCanvas, TEnvironment, TConsole, TLog) {
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
        var console = new TConsole();
        var consoleElement = console.getElement();
        consoleElement.className = consoleElement.className + " split-pane-component tframe-bottom-top";
        bottomDivInner.appendChild(consoleElement);
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
            console.displayed();
            log.displayed();
            $('.split-pane').splitPane();
        };

    }
    
    return TFrame;
});
