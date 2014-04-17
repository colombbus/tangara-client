define(['jquery','TEnvironment', 'TUtils', 'CommandManager', 'TObject'], function($, TEnvironment, TUtils, CommandManager, TObject) {
    var KeyStroke = function() {
        TObject.call(this);
        this.commands = new CommandManager();
        this.active = true;
        this.keyDown = false;
        this.keyboardEnabled = false;
        this.checkAllKeysUp = false;
        this.keys = new Array();
        var that = this;
        this.listenerKeyDown = function(e) {
            that.processKeyDown(e);
            e.preventDefault();
        };
        this.listenerKeyUp = function(e) {
            that.processKeyUp(e);
            e.preventDefault();
        };
        this.enableKeyboard();
    };

    var qInstance = TEnvironment.getQuintusInstance();

    KeyStroke.prototype = new TObject();
    KeyStroke.prototype.constructor = KeyStroke;
    KeyStroke.prototype.className = "KeyStroke";

    KeyStroke.prototype.getKeyCode = function(key) {
        key = TUtils.removeAccents(key);
        key = this.getMessage(key);
        return TUtils.getkeyCode(key);
    };

    KeyStroke.prototype.enableKeyboard = function() {
        if (this.keyboardEnabled) {
            return false;
        }
        var element = qInstance.el;

        // Copied from Quintus_input
        element.tabIndex = 0;
        element.style.outline = 0;
        
        element.addEventListener("keydown",this.listenerKeyDown, false);
        element.addEventListener("keyup",this.listenerKeyUp, false);

        this.keyboardEnabled = true;
    };

    KeyStroke.prototype.disableKeyboard = function() {
        if (!this.keyboardEnabled) {
            return false;
        }
        var element = qInstance.el;

        element.removeEventListener("keydown",this.listenerKeyDown, false);
        element.removeEventListener("keyup",this.listenerKeyUp, false);

        this.keyboardEnabled = false;
    };

    KeyStroke.prototype._addCommand = function(key, command) {
        if (TUtils.checkString(key)&&TUtils.checkCommand(command)) {
            var keycode = this.getKeyCode(key);
            if (keycode !== false) {
                this.keys[keycode] = false;
                this.commands.addCommand(command, keycode+"_down");
            }
        }
    };
    
    KeyStroke.prototype._removeCommands = function(key) {
        if (TUtils.checkString(key)) {
            var keycode = this.getKeyCode(key);
            if (keycode !== false) {
                this.commands.removeCommands(keycode+"_down");
                if (! this.commands.hasCommands(keycode+"up")) {
                    this.keys[keycode] = undefined;
                }
            }
        }
    };

    KeyStroke.prototype._addCommandRelease = function(param1, param2) {
        var key, command;
        if (typeof param2 !== 'undefined') {
            key = param1;
            command = param2;
        } else {
            command = param1;
        }
        if (TUtils.checkCommand(command)) {
            if (TUtils.checkString(key)) {
                // command to be launched when a given key is released
                var keycode = this.getKeyCode(key);
                if (keycode !== false) {
                    this.keys[keycode] = false;
                    this.commands.addCommand(command, keycode+"_up");
                }
            } else {
                // command to be launched when all keys are released
                this.commands.addCommand(command, "key_up_all");
                this.checkAllKeysUp = true;
            }
        }
    };

    KeyStroke.prototype._removeCommandRelease = function(key) {
        if (TUtils.checkString(key)) {
            // remove commands to be launched when a given key is released
            var keycode = this.getKeyCode(key);
            if (keycode !== false) {
                this.commands.removeCommands(keycode+"_up");
                if (! this.commands.hasCommands(keycode+"down")) {
                    this.keys[keycode] = undefined;
                }
            }
        } else {
            // remove commands to be launched when all keys are released
            this.commands.removeCommands("key_up_all");
            this.checkAllKeysUp = false;
        }
    };
    
    KeyStroke.prototype._activate = function() {
        this.active = true;
    };

    KeyStroke.prototype._deactivate = function() {
        if (this.active) {
            this.active = false;
            for (var keycode in this.keys) {
                this.keys[keycode] = false;
            }
        }
    };
    
    KeyStroke.prototype.deleteObject = function() {
        // remove listeners
        this.disableKeyboard();

        // delete commands
        for (var keycode in this.keys) {
            this.commands.removeCommands(keycode+"_down");
            this.commands.removeCommands(keycode+"_up");
        }
        this.commands.removeCommands("key_up_all");
        this.commands = undefined;
        
        // delete keys
        this.keys.length = 0;
        this.keys = undefined;
        
	TObject.prototype.deleteObject.call(this);
    };

    KeyStroke.prototype.processKeyDown = function(e) {
        if (this.active) {
            var keycode = e.keyCode;
            this.commands.executeCommands({'field':keycode+"_down"});
            this.keys[keycode] = true;
        }
    };

    KeyStroke.prototype.processKeyUp = function(e) {
        if (this.active) {
            var keycode = e.keyCode;
            this.commands.executeCommands({'field':keycode+"_up"});
            this.keys[keycode] = false;
            if (this.checkAllKeysUp) {
                for (var value in this.keys) {
                    if (this.keys[value]) {
                        // there is still a key down: we skip the test
                        return;
                    }
                }
                this.commands.executeCommands({'field':"key_up_all"});
            }
        }
    };
    
    KeyStroke.prototype.freeze = function(value) {
        if (value) {
            this.disableKeyboard();
        } else {
            this.enableKeyboard();
        }
        TObject.prototype.freeze.call(this, value);
    };

    TEnvironment.internationalize(KeyStroke, true);
    
    return KeyStroke;
});



