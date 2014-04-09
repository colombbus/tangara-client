define(['jquery','TEnvironment', 'TUtils', 'objects/TObject'], function($, TEnvironment, TUtils, TObject) {
    var KeyStroke = function() {
        TObject.call(this);
    };

    var qInstance = TEnvironment.getQuintusInstance();

    KeyStroke.prototype = new TObject();
    KeyStroke.prototype.constructor = KeyStroke;
    KeyStroke.prototype.className = "KeyStroke";

    KeyStroke.prototype.commands = new Array();

    KeyStroke.prototype._addCommand = function(key, command) {
        if (TUtils.checkString(key)&&TUtils.checkString(command)) {
            key = TUtils.removeAccents(key);
            key = this.getMessage(key);
            var keycode = TUtils.getkeyCode(key);
            if (keycode !== false) {
                var eventName = "key_"+keycode;
                if (typeof this.commands[eventName] === 'undefined') {
                    this.commands[eventName] = new Array();
                    var map = new Array();
                    map[keycode] = eventName;
                    qInstance.input.keyboardControls(map);
                    qInstance.input.on(eventName, this, "processKey");
                    qInstance.input.on(eventName+"Up", this, "processKeyUp");
                }
                this.commands[eventName].push(command);
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
                if (typeof this.commands[eventName] !== 'undefined') {
                	this.commands[eventName] = undefined;
                	qInstance.input.keys[keycode] = undefined;
                }
            }
        }
    };
    
    Keystroke.prototype._activate = function() {
	    
    };

    Keystroke.prototype._deactivate = function() {
	    
    };
    
    Keystroke.prototype.deleteObject = function() {
    	
	    TObject.deleteObject.call(this);
    }

    KeyStroke.prototype.processKey = function() {
        var that = this;
        $.each(qInstance.inputs, function(eventName, value) {
            if (value && typeof that.commands[eventName] !== 'undefined') {
                for (var i = 0; i < that.commands[eventName].length; i++) {
                    TEnvironment.execute(that.commands[eventName][i]);
                }
            }
        });
    };

    KeyStroke.prototype.processKeyUp = function() {
        
    };

    TEnvironment.internationalize(KeyStroke);
    
    return KeyStroke;
});



