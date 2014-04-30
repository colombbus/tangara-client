define(['jquery','TCanvas'], function($, TCanvas) {
    function TLog() {
        var domOuterLog = document.createElement("div");
        domOuterLog.id = "tlog-outer";
        var domLog = document.createElement("div");
        domLog.id = "tlog-inner";
        domOuterLog.appendChild(domLog);
                
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
        };
        
        this.addLines = function(text, errorMessage) {
            if (typeof text === 'string') {
                var lines = text.split("\n");
                var success = (typeof(errorMessage) === 'undefined');
                for (var i=0; i<lines.length;i++) {
                    line = lines[i];
                    var row = document.createElement("div");
                    if (success) {
                        row.className = "tlog-row tlog-success";
                    } else {
                        row.className = "tlog-row tlog-failure";
                    }
                    row.appendChild(document.createTextNode(line));
                    domLog.appendChild(row);
                    domOuterLog.scrollTop = domOuterLog.scrollHeight;
                }
                if (!success) {
                    var row = document.createElement("div");
                    row.className = "tlog-row tlog-failure";
                    row.appendChild(document.createTextNode(errorMessage));
                    domLog.appendChild(row);
                    domOuterLog.scrollTop = domOuterLog.scrollHeight;
                }
            }
        };
        
        this.addMessage = function(text) {
            if (typeof text === 'string') {
                var row = document.createElement("div");
                row.className = "tlog-row tlog-message";
                row.appendChild(document.createTextNode(text));
                domLog.appendChild(row);
                domOuterLog.scrollTop = domOuterLog.scrollHeight;
            }
        };
        
        this.clear = function() {
            domLog.innerHTML = '';
        };

    } 
    
    return TLog;
});