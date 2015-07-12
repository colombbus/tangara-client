define([], function() {
    function TExecutionLog() {
        this.addCommand = function(text) {
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
            if (typeof message === 'string') {
                window.console.log("error: " + message);
            }
        };

        this.addMessage = function(text) {
            window.console.log("message: " + text);
        };

        this.clear = function() {
        };

        this.saveScroll = function() {
        };

        this.restoreScroll = function() {
        };

        this.getError = function(index) {
            return null;
        };

    }

    return TExecutionLog;
});