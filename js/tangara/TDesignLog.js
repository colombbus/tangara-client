define(['jquery', 'TUI'], function($, TUI) {
    function TDesignLog() {
        var domDesignLog = document.createElement("div");
        domDesignLog.id = "tdesign-log";
        
        this.getElement = function() {
            return domDesignLog;
        };
        
        this.displayed = function() {
        };
        
        this.isEmpty = function() {
            return true;
        };
        
    }
    
    return TDesignLog;
});