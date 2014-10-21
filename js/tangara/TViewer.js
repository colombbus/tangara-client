define(['TUI', 'TEnvironment', 'jquery'], function(TUI, TEnvironment, $) {
    function TViewer() {
        var currentName = '';
        var nextHandler = null;
        var prevHandler = null;

        var domMain = document.createElement("div");
        domMain.className= "tviewer-main loading";
        var domImage = document.createElement("div");
        domImage.className= "tviewer-image";
        var image = document.createElement("img");
        image.onload = function() {
                domImage.appendChild(image);
                domMain.appendChild(domImage);
                imageDisplayed = true;
                $domMain.removeClass("loading");
                updateImageSize();
        };
        domImage.appendChild(image);
        var domButtonClose = document.createElement("div");
        domButtonClose.className = "tviewer-button-close";
        domButtonClose.onclick = function() {
            hide();
        };
        var domButtonLeft = document.createElement("div");
        domButtonLeft.className = "tviewer-button-left";
        domButtonLeft.onclick = function() {
            if (prevHandler !== null) {
                displayImage(prevHandler());
            }
        };
        var domButtonRight = document.createElement("div");
        domButtonRight.className = "tviewer-button-right";
        domButtonRight.onclick = function() {
            if (nextHandler !== null) {
                displayImage(nextHandler());
            }
        };
        var domTitle = document.createElement("div");
        domTitle.className = "tviewer-title";
        domImage.appendChild(domButtonClose);
        domImage.appendChild(domButtonLeft);
        domImage.appendChild(domButtonRight);
        domImage.appendChild(domTitle);
        
        var $domMain = $(domMain);
        var $domTitle = $(domTitle);
        var $domImage = $(domImage);
        var $image = $(image);
        $domMain.hide();        
        
        var keyHandler = function(event) {
            switch(event.which){
                case 27: //ESC
                    hide();
                    break;   
                case 39: // right arrow
                case 40: // down arrow
                    if (nextHandler !== null) {
                        displayImage(nextHandler());
                    }
                    break;
                case 37: //left arrow
                case 38: // up arrow
                    if (prevHandler !== null) {
                        displayImage(prevHandler());
                    }
                    break;                    
            }
        };
        
        var appended = false;
        var imageDisplayed = false;
        
        var hide = function() {
            if (appended) {
                $domMain.fadeOut();       
                document.body.removeChild(domMain);
                $(window).off('keydown', keyHandler);
                appended = false;
            }
            if (imageDisplayed) {
                domMain.removeChild(domImage);
                imageDisplayed = false;
            }            
        };
        
        var displayImage = function(name) {
            if (imageDisplayed) {
                domMain.removeChild(domImage);
                imageDisplayed = false;
            }
            $domMain.addClass("loading");
            currentName = name;
            // init max dimensions: they will be set in onload
            $image.css("max-width","");
            $image.css("max-height","");
            image.src = TEnvironment.getProjectResource(name);
            if (image.complete) {
                // image already loaded
                image.onload();
            }
            $domTitle.text(name);
        };
        
        var updateImageSize = function() {
            $image.css("max-width", $domImage.width());
            $image.css("max-height", $domImage.height());
        };
        
        this.setName = function(value) {
            currentName = value;
        };
        
        this.setNextHandler = function(value) {
            nextHandler = value;
        };

        this.setPrevHandler = function(value) {
            prevHandler = value;
        };
        
        this.show = function(name) {
            if (!appended) {
                document.body.appendChild(domMain);
                $(window).on('keydown', keyHandler);
                appended = true;
                $domMain.fadeIn();
            }
            displayImage(name);
        };
        
        this.hide = function() {
            hide();
        };
        
    }
    
    return TViewer;
});

