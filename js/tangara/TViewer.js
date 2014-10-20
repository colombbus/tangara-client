define(['TUI', 'TEnvironment', 'jquery'], function(TUI, TEnvironment, $) {
    function TViewer() {
        var domMain = document.createElement("div");
        domMain.className= "tviewer-main loading";
        var $domMain = $(domMain);
        $domMain.hide();
        
        var keyHandler = function(event) {
            switch(event.which){
                case 27: //ESC
                    hide();
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
                domMain.innerHTML = "";
                imageDisplayed = false;
            }            
        };
        
        this.show = function(url) {
            if (!appended) {
                document.body.appendChild(domMain);
                $(window).on('keydown', keyHandler);
                appended = true;
                $domMain.fadeIn();
            } 
            if (imageDisplayed) {
                domMain.innerHTML="";
                imageDisplayed = false;
            }
            $domMain.addClass("loading");
            var image = document.createElement("img");
            image.className = "tviewer-image";
            image.onload = function() {
                domMain.appendChild(image);
                imageDisplayed = true;
                $domMain.removeClass("loading");
            };
            image.src = url;
        };
        
        this.hide = function() {
            hide();
        };
        
    }
    
    return TViewer;
});

