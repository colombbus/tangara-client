define(['jquery', 'split-pane','TCanvas', 'TEditor', 'TSidebar', 'TUI', 'TConsole', 'TToolbar','TLog', 'TRuntime', 'TEnvironment'], function($, SplitPane, TCanvas, TEditor, TSidebar, TUI, TConsole, TToolbar, TLog, TRuntime, TEnvironment) {
    function TFrame() {
        var initialized = false;
        var domFrame = document.createElement("div");
        domFrame.id = "tframe";
        domFrame.className = "split-pane horizontal-percent";
        var topDiv = document.createElement("div");
        topDiv.id = "tframe-top";
        topDiv.className = "split-pane-component";
        // Add Canvas
        var canvas = new TCanvas();
        topDiv.appendChild(canvas.getElement());
        // Add Sidebar
        var sidebar = new TSidebar();
        topDiv.appendChild(sidebar.getElement());
        // Add Editor
        var editor = new TEditor();
        topDiv.appendChild(editor.getElement());

        domFrame.appendChild(topDiv);

        var separator = document.createElement("div");
        separator.id="tframe-separator";
        separator.className="split-pane-divider";
        domFrame.appendChild(separator);

        // Add Console, Toolbar and Log
        var bottomDiv = document.createElement("div");
        bottomDiv.id = "tframe-bottom";
        bottomDiv.className = "split-pane-component";
        // create special div to allow log to fill up remaining height
        var bottomTopDiv = document.createElement("div");
        bottomTopDiv.id = "tframe-bottom-top";
        var console = new TConsole();
        var consoleElement = console.getElement();
        bottomTopDiv.appendChild(consoleElement);
        var toolbar = new TToolbar();
        var toolbarElement = toolbar.getElement();
        bottomTopDiv.appendChild(toolbarElement);
        bottomDiv.appendChild(bottomTopDiv);
        var log = new TLog();
        var logElement = log.getElement();
        bottomDiv.appendChild(logElement);
        domFrame.appendChild(bottomDiv);
        
        var loadingDiv = document.createElement("div");
        loadingDiv.id = "tframe-loading";
        var loadingImg = document.createElement("img");
        loadingImg.src = TEnvironment.getBaseUrl() + "/images/loader2.gif";
        loadingDiv.appendChild(loadingImg);
        domFrame.appendChild(loadingDiv);

        // Set UI
        TUI.setFrame(this);
        TUI.setCanvas(canvas);
        TUI.setEditor(editor);
        TUI.setSidebar(sidebar);
        TUI.setToolbar(toolbar);
        TUI.setConsole(console);
        TUI.setLog(log);
        
        // Plug Runtime with Canvas and Log
        TRuntime.setCanvas(canvas);
        TRuntime.setLog(log);
        
        this.getElement = function() {
            return domFrame;
        };
        
        this.displayed = function() {
            canvas.displayed();
            editor.displayed();
            sidebar.displayed();
            console.displayed();
            toolbar.displayed();
            log.displayed();
            $('.split-pane').splitPane();
            initialized = true;
            this.ready();
        };
        
        this.ready = function() {
            TEnvironment.frameReady(function() {
                $(loadingDiv).fadeOut(1000, function() {$(this).remove();});
            });
        };
        
        this.lowerSeparator = function(value) {
            if (initialized) {
                var frameEl = $(domFrame);
                var separatorEl = $(separator);
                var topEl = $(topDiv);
                var bottomEl = $(bottomDiv);
                var totalHeight = frameEl.height();
                var currentBottom = totalHeight - (separatorEl.position().top+separatorEl.height());
                var newBottom = ((currentBottom  - value)* 100/ totalHeight) + '%';
                topEl.css('bottom', newBottom);
		separatorEl.css('bottom', newBottom);
		bottomEl.css('height', newBottom);
		frameEl.resize();
            }
        };
        
        this.raiseSeparator = function(value) {
            this.lowerSeparator(-value);
        };
        
        // Declare global functions
        
        if (typeof window.updateEnvironment === 'undefined') {
            window.updateEnvironment = function(showEditor) {
                if (typeof showEditor !== 'undefined' && showEditor) {
                    TUI.enableEditor();
                }
                TUI.init();
            };
        }        

        if (typeof window.isUnsaved === 'undefined') {
            window.isUnsaved = function() {
                return TEnvironment.getProject().isUnsaved();
            };
        }        


    }
    
    return TFrame;
});
