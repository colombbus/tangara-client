define(['jquery', 'TUI'], function($, TUI) {
    function TDesignLog() {
        var domDesignLog = document.createElement("div");
        domDesignLog.id = "tdesign-log";
        var domDesignLogHandle = document.createElement("div");
        domDesignLogHandle.id = "tdesign-log-handle";
        domDesignLog.appendChild(domDesignLogHandle);
        var $designLog = $(domDesignLog);
        var $designLogHandle = $(domDesignLogHandle);
        $designLog.hide();
        domDesignLogHandle.onclick = function() { TUI.toggleDesignLog(); };
        
        
        this.getElement = function() {
            return domDesignLog;
        };
        
        this.displayed = function() {
        };

        this.show = function() {
            $designLog.show().animate({left: "60%"}, 500, function() {$designLogHandle.addClass('open');});
        };
        
        this.hide = function() {
            if (this.isEmpty()) {
                $designLog.animate({left: "100%"}, 500, function() {$(this).hide();$designLogHandle.removeClass('open');});
            } else {
                $designLog.animate({left: "100%"}, 500, function() {$designLogHandle.removeClass('open');});
            }
        };
        
        this.isEmpty = function() {
            return true;
        };
        
        this.hideIfEmpty = function() {
            if (this.isEmpty()) {
                this.hide();
                return true;
            } else {
                return false;
            }
        };
    }
    
    return TDesignLog;
});