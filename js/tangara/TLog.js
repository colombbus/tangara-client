define(['jquery', 'TUI', 'TDesignLog'], function($, TUI, TDesignLog) {
    function TLog() {
        var domOuterLog = document.createElement("div");
        domOuterLog.id = "tlog-outer";
        var domInnerLog = document.createElement("div");
        domInnerLog.id = "tlog-inner";
        var domLog = document.createElement("div");
        domLog.id = "tlog";
        domInnerLog.appendChild(domLog);
        domOuterLog.appendChild(domInnerLog);
        var designLog = new TDesignLog();
        var domDesignLog = designLog.getElement();
        domInnerLog.appendChild(domDesignLog);
        
        var rowCount = 0;
        var currentRow = 0;
        var scrollTop = 0;
        var errors = new Array();
        
        this.getElement = function() {
            return domOuterLog;
        };

        this.displayed = function() {
            this.update();
        };
        
        this.update = function() {
            // compute the margin from the height of "tframe-bottom-top" div
            var height = $("#tframe-bottom-top").height();
            domOuterLog.style.marginTop = "-"+height+"px";
            domOuterLog.style.paddingTop = height+"px";
            //domDesignLog.style.top = height+"px";
        };

        this.addCommand = function(text) {
            if (typeof text === 'string') {
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
            }
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
                window.console.debug(error);
            }
            var index = errors.push(error) -1;
            var wrapper = document.createElement("div");
            wrapper.onclick = function() { TUI.handleError(index); };
            var row;
            wrapper.className = "tlog-row tlog-failure";            
            if (typeof code === 'string') {
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
            }
            if (typeof message === 'string') {
                row = document.createElement("div");
                row.appendChild(document.createTextNode(message));
                wrapper.appendChild(row);
            }
            domLog.appendChild(wrapper);
            domLog.scrollTop = domLog.scrollHeight;
        };
        
        this.addMessage = function(text) {
            if (typeof text === 'string') {
                var row = document.createElement("div");
                row.className = "tlog-row tlog-message";
                row.appendChild(document.createTextNode(text));
                domLog.appendChild(row);
                domLog.scrollTop = domLog.scrollHeight;
            }
        };
        
        this.clear = function() {
            domLog.innerHTML = '';
            rowCount = 0;
            currentRow = 0;
            errors.length = 0;
        };
        
        this.getPreviousRow = function() {
            if (currentRow > 0) {
                currentRow--;
                var element = $("#tlog-row-"+currentRow);
                if (typeof element !== 'undefined') {
                    return element.text();
                }
            } else {
                // First row reached
                return null;
            }
        };

        this.getNextRow = function() {
            if (currentRow < rowCount) {
                currentRow++;
                if (currentRow < rowCount) {
                    var element = $("#tlog-row-"+currentRow);
                    if (typeof element !== 'undefined') {
                        return element.text();
                    }
                } else {
                    // Last row reached
                    return null;
                }
            } else {
                // Last row reached
                return null;
            }
        };
        
        this.setLastRow = function() {
            currentRow = rowCount;
        };

        this.saveScroll = function() {
            scrollTop = $(domLog).scrollTop();
        };
        
        this.restoreScroll = function() {
            $(domLog).scrollTop(scrollTop);
        };
        
        this.getError = function(index) {
           if (index < errors.length) {
               return errors[index];
           }
           return null;           
        };
        
        this.showDesignLog = function() {
            designLog.show();
        };
        
        this.hideDesignLog = function() {
            designLog.hide();
        };
        
        this.hideDesignLogIfEmpty = function() {
            return designLog.hideIfEmpty();
        };

    } 
    
    return TLog;
});