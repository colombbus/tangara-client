define(['jquery', 'TEnvironment'], function($, TEnvironment) {
    function TDesignLog() {
        var domDesignLog = document.createElement("div");
        domDesignLog.id = "tdesign-log";
        var $designLog = $(domDesignLog);
        
        this.getElement = function() {
            return domDesignLog;
        };
        
        this.isEmpty = function() {
            return $designLog.is(':empty');
        };
        
        this.addObjectLocation = function(name, location) {
            var elementId = "tdesign-log-"+name;
            var $element = $designLog.find("#"+elementId);
            var locationText = TEnvironment.getMessage("location-text", location.x, location.y);
            if ($element.length > 0) {
                // element already exists
                $element.find(".tdesign-log-name").text(name);
                $element.find(".tdesign-log-location").addClass("active").text(locationText).delay(500).queue(function() {
                    $(this).removeClass("active");
                    $(this).dequeue();
                });
            } else {
                // we create element
                var domElement = document.createElement("div");
                domElement.id = elementId;
                domElement.className = "tdesign-log-row";
                var domName = document.createElement("div");
                domName.className = "tdesign-log-name";
                domName.innerHTML = name;
                var domLocation = document.createElement("div");
                domLocation.className = "tdesign-log-location";
                domLocation.innerHTML = locationText;
                domElement.appendChild(domName);
                domElement.appendChild(domLocation);
                domDesignLog.appendChild(domElement);
                domElement.setAttribute("draggable", "true");
                domElement.ondragstart = function(e) {
                    var element = $(e.target);
                    var name = element.find(".tdesign-log-name").text();
                    var coordinates = element.find(".tdesign-log-location").text();
                    e.dataTransfer.setData("text/plain", TEnvironment.getMessage("set-location-command", name, coordinates));
                };
                domDesignLog.scrollTop = domDesignLog.scrollHeight;
            }
        };
        
    }
    
    return TDesignLog;
});