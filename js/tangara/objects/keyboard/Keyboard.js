define(['TUtils', 'SynchronousManager', 'TObject', 'TRuntime'], function( TUtils,SynchronousManager, TObject, TRuntime) {
    /**
     * Defines KeyStroke, inherited from TObject.
     * Allows the association of commands with keyboard.
     * @exports KeyStroke
     */
    var Keyboard = function() {
        this.active = false;
        this.keyboardEnabled = false;
        this.waiting = false;
        this.keyWaited = false;
        this.keys = [];
        var that = this;
        this.listenerKeyDown = function(e) {
            that.processKeyDown(e);
            e.preventDefault();
        };
        this.listenerKeyUp = function(e) {
            that.processKeyUp(e);
            e.preventDefault();
        };
        this.synchronousManager = new SynchronousManager();
        TRuntime.addInstance(this);
    };

    Keyboard.prototype = Object.create(TObject.prototype);
    Keyboard.prototype.constructor = Keyboard;
    Keyboard.prototype.className = "Keyboard";

    /**
     * Returns the Keycode of a key.
     * @param {String} key
     * @returns {Number}    Keycode corresponding to key.
     */
    Keyboard.prototype.getKeyCode = function(key) {
        key = TUtils.removeAccents(key);
        key = this.getMessage(key);
        var code = TUtils.getkeyCode(key);
        if (code === false) {
            throw new Error(TUtils.format(this.getMessage("unknwon key"), key));
        }
        return code;
    };

    /**
     * Enable the possibility to use keyboard.
     * @returns {Boolean}   Returns false if already enabled.
     */
    Keyboard.prototype.enableKeyboard = function() {
        if (this.keyboardEnabled) {
            return false;
        }

        var element = TRuntime.getGraphics().getElement();
        
        if (typeof element !== 'undefined') {

            // Copied from Quintus_input
            element.tabIndex = 0;
            element.style.outline = 0;

            element.addEventListener("keydown", this.listenerKeyDown, false);
            element.addEventListener("keyup", this.listenerKeyUp, false);

            this.keyboardEnabled = true;
        }
    };

    /**
     * Disable the possibility to use keyboard.
     * @returns {Boolean}   Returns false if already disabled.
     */
    Keyboard.prototype.disableKeyboard = function() {
        if (!this.keyboardEnabled) {
            return false;
        }
        var element = TRuntime.getGraphics().getElement();

        element.removeEventListener("keydown", this.listenerKeyDown, false);
        element.removeEventListener("keyup", this.listenerKeyUp, false);

        this.keyboardEnabled = false;
    };

    /**
     * Checks which keys are down and execute associated commands.
     * @param {type} e
     */
    Keyboard.prototype.processKeyDown = function(e) {
        if (this.active) {
            if (this.waiting) {
                this.waiting = false;
                this.keyWaited = e.keyCode;
                this.synchronousManager.end();
            } else {
                this.keyWaited = false;
            }
            var keycode = e.keyCode;
            this.keys[keycode] = true;
        }
    };
    
    /**
     * Checks which keys are up and execute associated commands.
     * @param {type} e
     */
    Keyboard.prototype.processKeyUp = function(e) {
        if (this.active) {
            var keycode = e.keyCode;
            this.keys[keycode] = false;
        }
    };

    /**
     * Enable or disable keyboard depending on value, and freeze it.
     * @param {Boolean} value
     */
    Keyboard.prototype.freeze = function(value) {
        if (value) {
            this.disableKeyboard();
        } else {
            this.enableKeyboard();
        }
        TObject.prototype.freeze.call(this, value);
    };

   
    /**
     * Detect if a given key is down
     * @param {String} key
     */
    Keyboard.prototype._wait = function(key) {
        if (!this.keyboardEnabled) {
            this.enableKeyboard();
        }
        this.waiting = true;
        this.synchronousManager.begin();
    };

    
    /**
     * Detect if a given key is down
     * @param {String} key
     */
    Keyboard.prototype._detect = function(key) {
        if (!this.keyboardEnabled) {
            this.enableKeyboard();
        }        
        var keycode = this.getKeyCode(key);
        return (this.keyWaited === keycode || (typeof this.keys[keycode] !== 'undefined' && this.keys[keycode]));
    };
    
    Keyboard.prototype.freeze = function(value) {
        this.active = !value;
    };

    Keyboard.prototype.clear = function() {
        this.waiting = false;
        this.keyWaited = false;
        this.keys = [];
    };
    
    
    var instance = new Keyboard();

    return instance;
});



