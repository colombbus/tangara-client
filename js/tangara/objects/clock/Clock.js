define(['jquery', 'TEnvironment', 'TObject', 'TUtils', 'CommandManager'], function($, TEnvironment, TObject, TUtils, CommandManager) {
    var Clock = function() {
        TObject.call(this);
        this.commands = new CommandManager();
        this.delay = 1000;
        this.initialDelay = false;
        this.running = false;
        this.wasRunning = false;
        this.timeout = null;
        this.loop = true;
        this.frozen = false;
    };

    Clock.prototype = Object.create(TObject.prototype);
    Clock.prototype.constructor = Clock;
    Clock.prototype.className = "Clock";

    Clock.prototype._addCommand = function(command) {
        command = TUtils.getCommand(command);
        this.commands.addCommand(command);
    };

    Clock.prototype._removeCommands = function() {
        this.commands.removeCommands();
    };

    Clock.prototype._setDelay = function(delay) {
        delay = TUtils.getInteger(delay);
        this.delay = delay;
        if (this.initialDelay === false) {
            this._setInitialDelay(delay);
        }
    };

    Clock.prototype._setInitialDelay = function(delay) {
        delay = TUtils.getInteger(delay);
        this.initialDelay = delay;
    };

    Clock.prototype._start = function() {
        if (!this.running) {
            this.running = true;
            var self = this;
            this.timeout = window.setTimeout(function() {
                self.executeActions();
            }, this.initialDelay);
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
                this.timeout = window.setTimeout(function() {
                    self.executeActions();
                }, this.delay);
            } else {
                this._stop();
            }
        }
    };

    Clock.prototype.deleteObject = function() {
        this._stop();
        TObject.prototype.deleteObject.call(this);
    };

    Clock.prototype._loop = function(value) {
        value = TUtils.getBoolean(value);
        this.loop = value;
    };

    Clock.prototype.freeze = function(value) {
        TObject.prototype.freeze.call(value);
        if (value !== this.frozen) {
            if (value) {
                this.wasRunning = this.running;
                this._stop();
                this.frozen = true;
            } else {
                if (this.wasRunning) {
                    this._start();
                }
                this.frozen = false;
            }
        }
    };

    Clock.prototype._displayCommands = function(value) {
        value = TUtils.getBoolean(value);
        this.commands.logCommands(value);
    };

    return Clock;
});


