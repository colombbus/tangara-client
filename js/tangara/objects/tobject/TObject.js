define(['jquery','TEnvironment'], function($, TEnvironment) {
    function TObject() {
        this.load();
    }

    TObject.prototype.className = "TObject";

    TObject.prototype.load = function() {
        if (this.className.length !== 0 && typeof this.constructor.messages === 'undefined') {
            this.constructor.messages = new Array();
            var messageFile = this.getResource("messages.json");
            var language = TEnvironment.getLanguage();
            var parent = this;
            $.ajax({
                dataType: "json",
                url: messageFile,
                global:false,
                async: false,
                success: function(data) {
                    if (typeof data[language] !== 'undefined'){
                        parent.constructor.messages = data[language];
                        window.console.log("found messages in language: "+language);
                    } else {
                        window.console.log("found no messages for language: "+language);
                    }
                },
                error: function(data, status, error) {
                    window.console.log("Error loading messages (messages.json)");
                }
            });
        }
    };
    
    TObject.prototype.deleteObject = function() {
        TEnvironment.deleteTObject(this);
    };

    TObject.prototype.getResource = function(location) {
        return TEnvironment.getObjectsUrl()+"/"+this.className.toLowerCase()+"/resources/"+location;
    };

    TObject.prototype.getMessage = function(code) {
        if (typeof this.constructor.messages[code] !== 'undefined') {
            return this.constructor.messages[code];
        } else {
            return code;
        }
    };
    
    TObject.prototype._delete = function() {
        this.deleteObject();
    };

    TObject.prototype.freeze = function(value) {
        // every object may add actions to take to freeze
    };

    return TObject;
});