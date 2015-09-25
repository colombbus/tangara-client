define(['objects/keystroke/KeyStroke'], function(KeyStroke) {
    /**
     * Defines OldKeyStroke, inherited from KeyStroke.
     * For backward compatibility only
     * @exports OldKeyStroke
     */
    var OldKeyStroke = function() {
        KeyStroke.call(this);
    };

    OldKeyStroke.prototype = Object.create(KeyStroke.prototype);
    OldKeyStroke.prototype.constructor = OldKeyStroke;
    OldKeyStroke.prototype.className = "OldKeyStroke";

    return OldKeyStroke;
});



