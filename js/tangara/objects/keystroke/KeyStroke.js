define(['jquery','TEnvironment', 'TUtils', 'CommandManager', 'objects/TObject'], function($, TEnvironment, TUtils, CommandManager, TObject) {
    var KeyStroke = function() {
        TObject.call(this);
        this.commands = new CommandManager();
    };

    var qInstance = TEnvironment.getQuintusInstance();

    KeyStroke.prototype = new TObject();
    KeyStroke.prototype.constructor = KeyStroke;
    KeyStroke.prototype.className = "KeyStroke";

    KeyStroke.prototype._addCommand = function(key, command) {
        if (TUtils.checkString(key)&&TUtils.checkCommand(command)) {
            key = TUtils.removeAccents(key);
            key = this.getMessage(key);
            var keycode = TUtils.getkeyCode(key);
            if (keycode !== false) {
                var eventName = "key_"+keycode;
                if (!this.commands.hasCommands(eventName)) {
                    // add key binding for this key
                    var map = new Array();
                    map[keycode] = eventName;
                    qInstance.input.keyboardControls(map);
                    qInstance.input.on(eventName, this, "processKey");
                    qInstance.input.on(eventName+"Up", this, "processKeyUp");
                }
                this.commands.addCommand(command, eventName);
            }
        }
    };
    
    KeyStroke.prototype._removeCommands = function(key) {
        if (TUtils.checkString(key)) {
            key = TUtils.removeAccents(key);
            key = this.getMessage(key);
            var keycode = TUtils.getkeyCode(key);
            if (keycode !== false) {
                var eventName = "key_"+keycode;
                if (this.commands.hasCommands(eventName)) {
                    qInstance.input.keys[keycode] = undefined;
                    this.commands.removeCommands(eventName);
                }
            }
        }
    };
    
    KeyStroke.prototype._activate = function() {
	    
    };

    KeyStroke.prototype._deactivate = function() {
	    
    };
    
    KeyStroke.prototype.deleteObject = function() {
    	
	    TObject.deleteObject.call(this);
    };

    KeyStroke.prototype.processKey = function() {
        var that = this;
        $.each(qInstance.inputs, function(eventName, value) {
            if (value) {
                that.commands.executeCommands({'field':eventName});
            }
        });
    };

    KeyStroke.prototype.processKeyUp = function() {
        
    };

    TEnvironment.internationalize(KeyStroke);
    
    return KeyStroke;
});



