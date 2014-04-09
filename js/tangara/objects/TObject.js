define(['jquery','TEnvironment'], function($, TEnvironment) {
    function TObject() {
        this.load();
    }

    TObject.prototype.className = "";

    TObject.prototype.messages = null;

    TObject.prototype.load = function() {
        if (this.className.length !== 0 && this.constructor.prototype.messages === null) {
            this.constructor.prototype.messages = new Array();
            var messageFile = this.getResource("messages.json");
            var language = TEnvironment.getLanguage();
            var parent = this;
            $.ajax({
                dataType: "json",
                url: messageFile,
                async: false,
                success: function(data) {
                    if (typeof data[language] !== 'undefined'){
                        parent.constructor.prototype.messages = data[language];
                        window.console.log("found messages in language: "+language);
                    } else {
                        window.console.log("found no messages for language: "+language);
                    }
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
        if (typeof this.messages[code] !== 'undefined') {
            return this.messages[code];
        } else {
            return code;
        }
    };
    
    TObject.prototype._delete = function() {
        this.deleteObject();
    };

    return TObject;
});