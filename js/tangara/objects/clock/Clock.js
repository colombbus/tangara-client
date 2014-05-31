define(['jquery','TEnvironment', 'TObject', 'TUtils', 'CommandManager'], function($, TEnvironment, TObject, TUtils, CommandManager) {
    var Clock = function() {
        TObject.call(this);
        this.commands = new CommandManager();
        this.delay = 1000;
        this.initialDelay = 0;
        this.running = false;
        this.wasRunning = false;
        this.timeout = null;
        this.loop = true;
    };
    
    Clock.prototype = Object.create(TObject.prototype);
    Clock.prototype.constructor = Clock;
    Clock.prototype.className = "Clock";    
    
    Clock.prototype._addCommand = function(command) {
        if (TUtils.checkCommand(command)) {
            this.commands.addCommand(command);
        } else {
            throw new Error(this.getMessage("wrong command"));
        }
    };

    Clock.prototype._removeCommands = function() {
        this.commands.removeCommands();
    };

    Clock.prototype._setDelay = function(delay) {
        if (TUtils.checkInteger(delay)) {
            this.delay = delay;
        } else {
            throw new Error(this.getMessage("wrong delay"));
        }
    };

    Clock.prototype._setInitialDelay = function(delay) {
        if (TUtils.checkInteger(delay)) {
            this.initialDelay = delay;
        } else {
            throw new Error(this.getMessage("wrong delay"));
        }
    };

    Clock.prototype._start = function() {
        if (!this.running) {
            this.running = true;
            var self = this;
            this.timeout = window.setTimeout(function() { self.executeActions(); }, this.initialDelay);
        }
    };

    Clock.prototype._stop = function() {
        this.running = false;
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
    };
    
    Clock.prototype.executeActions = function() {
        this.timeout = null;
        if (this.running) {
            this.commands.executeCommands();
            if (this.loop) {
                var self = this;
                this.timeout = window.setTimeout(function() { self.executeActions(); }, this.delay);
            }
        }
    };

    Clock.prototype.deleteObject = function() {
        this._stop();
        TObject.prototype.deleteObject.call(this);
    };

    Clock.prototype._loop = function(value) {
        if (TUtils.checkBoolean(value)) {
            this.loop = value;
        }
    };
    
    Clock.prototype.freeze = function(value) {
        TObject.prototype.freeze.call(value);
        if (value) {
            this.wasRunning = this.running;
            this._stop();
        } else {
            if (this.wasRunning) {
                this._start();
            }
        }
    };

    Clock.prototype._displayCommands = function(value) {
        if (TUtils.checkBoolean(value)) {
            this.commands.logCommands(value);
        }
    };
    
    TEnvironment.internationalize(Clock, true);
    
    return Clock;
});


