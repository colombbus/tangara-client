define(['jquery', 'TEnvironment'], function($, TEnvironment) {
    function TLearnLog() {
        /*var domOuterLog = document.createElement("div");
        domOuterLog.id = "tlog-outer";
        var domInnerLog = document.createElement("div");
        domInnerLog.id = "tlog-inner";
        var domSwitch = document.createElement("div");
        domSwitch.id = "tlog-switch";
        var switchLog = document.createElement("div");
        switchLog.id = "tlog-switch-log";
        switchLog.title = TEnvironment.getMessage("switch-log");
        switchLog.className="active";
        var switchDesign = document.createElement("div");
        switchDesign.id = "tlog-switch-design";
        switchDesign.title = TEnvironment.getMessage("switch-design");
        switchLog.onclick = function(e) { TUI.hideDesignLog();};
        switchDesign.onclick = function(e) { TUI.showDesignLog();};
        domSwitch.appendChild(switchLog);
        domSwitch.appendChild(switchDesign);
        domOuterLog.appendChild(domSwitch);
        var domLog = document.createElement("div");
        domLog.id = "tlog";
        domInnerLog.appendChild(domLog);
        var designLog = new TDesignLog();
        var domDesignLog = designLog.getElement();
        domInnerLog.appendChild(domDesignLog);
        domOuterLog.appendChild(domInnerLog);
        var $log = $(domLog); 
        var $designLog = $(domDesignLog);
        var $switch = $(domSwitch);
        var $innerLog = $(domInnerLog); 
        
        
        var rowCount = 0;
        var currentRow = 0;
        var scrollTop = 0;
        
        var currentHeight = -1;
        
        var errors = new Array();
        
        this.getElement = function() {
            return domOuterLog;
        };

        this.displayed = function() {
            this.update();
            $designLog.hide();
            $switch.hide();
        };
        
        this.update = function() {
            // compute the margin from the height of "tframe-bottom-top" div
            var height = $("#tframe-bottom-top").height();
            domOuterLog.style.marginTop = "-"+height+"px";
            domOuterLog.style.paddingTop = height+"px";
        };*/
        
        var frame = null;
        
        
        this.setFrame = function(value) {
            frame = value;
        };

        this.addCommand = function(text) {
            /*if (typeof text === 'string') {
                var lines = text.split("\n");
                for (var i=0; i<lines.length;i++) {
                    var line = lines[i];
                    var row = document.createElement("div");
                    row.className = "tlog-row tlog-success";
                    row.id = "tlog-row-"+rowCount;
                    rowCount++;
                    currentRow = rowCount;
                    row.appendChild(document.createTextNode(line));
                    domLog.appendChild(row);
                    domLog.scrollTop = domLog.scrollHeight;
                }
            }*/
            console.log("executing command: "+text);
        };

        this.addError = function(error) {
            var code, message;
            if (typeof error.getCode !== 'undefined') {
                code = error.getCode();
            }
            if (typeof error.getMessage !== 'undefined') {
                message = error.getMessage();
            } else if (typeof error.message !== 'undefined') {
                message = error.message;
            } else {
                message = 'undefined error';
            }
            /*if (typeof code === 'string') {
                var lines = code.split("\n");
                for (var i=0; i<lines.length;i++) {
                    var line = lines[i];
                    row = document.createElement("div");
                    row.id = "tlog-row-"+rowCount;
                    rowCount++;
                    currentRow = rowCount;
                    row.appendChild(document.createTextNode(line));
                    wrapper.appendChild(row);
                }
            }*/
            if (typeof message === 'string') {
                frame.showError(message)
            }
        };
        
        this.addMessage = function(text) {
            /*if (typeof text === 'string') {
                var row = document.createElement("div");
                row.className = "tlog-row tlog-message";
                row.appendChild(document.createTextNode(text));
                domLog.appendChild(row);
                domLog.scrollTop = domLog.scrollHeight;
            }*/
            console.log("message: "+text);
        };
        
        this.clear = function() {
            /*domLog.innerHTML = '';
            rowCount = 0;
            currentRow = 0;
            errors.length = 0;
            designLog.clear();
            this.hideDesignLog();
            this.hideSwitch();*/
        };
        
        

        this.saveScroll = function() {
            /*scrollTop = $(domLog).scrollTop();*/
        };
        
        this.restoreScroll = function() {
            /*$(domLog).scrollTop(scrollTop);*/
        };
        
        this.getError = function(index) {
           /*if (index < errors.length) {
               return errors[index];
           }*/
           return null;           
        };
        
    } 
    
    return TLearnLog;
});