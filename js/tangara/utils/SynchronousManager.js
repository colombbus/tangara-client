define(['TRuntime'], function(TRuntime) {
    var SynchronousManager = function() {
        this.running = false;
    };

    SynchronousManager.prototype.begin = function() {
        TRuntime.suspend();
        this.running = true;
    };

    SynchronousManager.prototype.end = function() {
        TRuntime.resume();
        this.running = false;
    };

    SynchronousManager.prototype.isRunning = function() {
        return this.running;
    };

    return SynchronousManager;
});


