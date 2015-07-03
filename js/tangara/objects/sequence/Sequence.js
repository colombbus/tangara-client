define(['jquery','TEnvironment', 'TObject', 'utils/TUtils', 'TRuntime'], function($, TEnvironment, TObject, TUtils, TRuntime) {
    var Sequence = function() {
        TObject.call(this);
        this.actions = new Array();
        this.index = -1;
        this.running = false;
        this.frozen = false;
        this.timeout = null;
        this.loop = false;
        this.wasRunning = false;
        this.logCommands = true;
    };
    
    Sequence.prototype = Object.create(TObject.prototype);
    Sequence.prototype.constructor = Sequence;
    Sequence.prototype.className = "Sequence";    
    
    Sequence.TYPE_COMMAND = 0x01;
    Sequence.TYPE_DELAY = 0x02;
    Sequence.MINIMUM_LOOP = 100;
    
    Sequence.prototype._addCommand = function(command) {
        command = TUtils.getCommand(command);
        this.actions.push({type:Sequence.TYPE_COMMAND,value:command});
    };

    Sequence.prototype._addDelay = function(delay) {
        delay = TUtils.getInteger(delay);
        this.actions.push({type:Sequence.TYPE_DELAY,value:delay});
    };
    
    Sequence.prototype.nextAction = function() {
        this.timeout = null;
        this.index++;
        if (this.actions.length > 0 && this.running) {
            if (this.index >= this.actions.length) {
                if (this.loop) {
                    this.index = 0;
                } else {
                    // last action reached: we stop here
                    this.running = false;
                    return;
                }
            }
            var action = this.actions[this.index];
            if (action.type === Sequence.TYPE_COMMAND) {
                // execute command
                TRuntime.execute(action.value, null, this.logCommands);
                this.nextAction();
            } else if (action.type === Sequence.TYPE_DELAY) {
                var self = this;
                this.timeout = window.setTimeout(function() { self.nextAction(); }, action.value);
            }
        }
    };
    
    Sequence.prototype._start = function() {
        if (this.running) {
            // Sequence is already running: restart it
            this._stop();
        }
        this.running = true;
        this.index = -1;
        this.nextAction();
    };

    Sequence.prototype._stop = function() {
        this.running = false;
        this.index = -1;
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
    };
    
    Sequence.prototype._pause = function() {
        this.running = false;
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
    };
    
    Sequence.prototype._unpause = function() {
        this.running = true;
        this.nextAction();
    };

    Sequence.prototype.deleteObject = function() {
        this._stop();
        TObject.prototype.deleteObject.call(this);
    };

    Sequence.prototype._loop = function(value) {
        value = TUtils.getBoolean(value);
        if (value) {
            // WARNING: in order to prevent Tangara freeze, check that there is at least a total delay of MINIMUM_LOOP in actions
            var totalDelay = 0;
            for (var i=0; i<this.actions.length;i++) {
                var action = this.actions[i];
                if (action.type === Sequence.TYPE_DELAY) {
                    totalDelay += action.value;
                }
            }
            if (totalDelay < Sequence.MINIMUM_LOOP) {
                throw new Error(this.getMessage("freeze warning",Sequence.MINIMUM_LOOP));
            }
        }            
        this.loop = value;
    };
    
    Sequence.prototype.freeze = function(value) {
        TObject.prototype.freeze.call(value);
        if (value !== this.frozen) {
            if (value) {
                this.wasRunning = this.running;
                this._pause();
                this.frozen = true;
            } else {
                if (this.wasRunning) {
                    this._unpause();
                }
                this.frozen = false;
            }
        }
    };

    Sequence.prototype._displayCommands = function(value) {
        value = TUtils.getBoolean(value);
        this.logCommands = value;
    };

    TEnvironment.internationalize(Sequence, true);
    
    return Sequence;
});


