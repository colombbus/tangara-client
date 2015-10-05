define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'TObject'], function($, TEnvironment, TUtils, CommandManager, TObject) {
    /**
     * Defines Information, inherited from TObject.
     * User can click on information and trigger an associated command.
     * @param {String} label    Text displayed on the information
     * @exports Information
     */
    var Information = function(label) {
        TObject.call(this);
        this.label = label;
        this.commands = new CommandManager();
    };

    Information.prototype = Object.create(TObject.prototype);
    Information.prototype.constructor = Information;
    Information.prototype.className = "Information";

    /**
     * Set a label for Information.
     * @param {String} label    Label to be displayed
     */
    Information.prototype._setText = function(label) {
        label = TUtils.getString(label);
        this.label = label;
    };

    /**
     * Associate a command to Information.
     * @param {String} command
     */
    Information.prototype._addCommand = function(command) {
        command = TUtils.getCommand(command);
        this.commands.addCommand(command);
        
    };

    /**
     * Remove all commands associated to information.
     */
    Information.prototype._removeCommands = function() {
        this.commands.removeCommands();
    };

    Information.prototype._show = function() {
        window.alert(this.label);
        this.commands.executeCommands();
    }

    return Information;
});



