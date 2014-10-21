define(['TUI', 'TEnvironment', 'jquery', 'wColorPicker', 'wPaint', 'wPaint/plugins/main','wPaint/plugins/text', 'wPaint/plugins/shapes', 'wPaint/plugins/file'], function(TUI, TEnvironment, $) {
    function TViewer() {
        var currentName = '';
        var currentWidth =0;
        var currentHeight =0;
        
        var nextHandler = null;
        var prevHandler = null;

        var domMain = document.createElement("div");
        domMain.className= "tviewer-main loading";
        var domImage = document.createElement("div");
        domImage.className= "tviewer-image";
        var image = document.createElement("img");
        image.onload = function() {
                $domImage.show();
                imageDisplayed = true;
                $domMain.removeClass("loading");
                updateImageSize();
                currentWidth = image.naturalWidth;
                currentHeight = image.naturalHeight;
                $domTitle.text(currentName+" ("+currentWidth+"x"+currentHeight+")");
        };
        domImage.appendChild(image);
        var domButtonEdit = document.createElement("div");
        domButtonEdit.className = "tviewer-button-edit";
        domButtonEdit.onclick = function() {
            edit();
        };
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
        domImage.appendChild(domButtonEdit);
        domImage.appendChild(domButtonClose);
        domImage.appendChild(domButtonLeft);
        domImage.appendChild(domButtonRight);
        domImage.appendChild(domTitle);
        domMain.appendChild(domImage);
        
        var domEditor = document.createElement("div");
        domEditor.className = "tviewer-editor";

        var domEditorImage = document.createElement("div");
        domEditorImage.className = "tviewer-editor-image";
        
        var domButtonClose2 = document.createElement("div");
        domButtonClose2.className = "tviewer-button-close";
        domButtonClose2.onclick = function() {
            hide();
        };
        
        var domMessage = document.createElement("div");
        domMessage.className = "tviewer-editor-message";
        
        domEditor.appendChild(domEditorImage);
        domEditor.appendChild(domButtonClose2);
        domEditor.appendChild(domMessage);
        domMain.appendChild(domEditor);
        
        var $domMain = $(domMain);
        var $domTitle = $(domTitle);
        var $domImage = $(domImage);
        var $image = $(image);
        var $domEditor = $(domEditor);
        var $domEditorImage = $(domEditorImage);
        var $domMessage = $(domMessage);
        
        $domMain.hide();
        $domImage.hide();
        $domEditor.hide();
        $domMessage.hide();
        
        var editorInitialized = false;
        
        // remove load buttons from wPaint menu
        delete $.fn.wPaint.menus.main.items.loadBg;
        delete $.fn.wPaint.menus.main.items.loadFg;
        
        $.extend($.fn.wPaint.defaults, {
            saveImg: function() {
                var imageData = $domEditorImage.wPaint("image");
                try {
                    TEnvironment.getProject().setResourceContent(currentName, imageData);
                    message(TEnvironment.getMessage('image-editor-saved', currentName));
                } catch (error) {
                    message(error.getMessage());
                }
           }
        });
        
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
        var imageEdited = false;
        
        var hide = function() {
            if (imageEdited) {
                // was in editing mode: get back to display mode
                $domEditor.hide();
                $domImage.show();
                imageEdited = false;
                imageDisplayed = true;
                // refreshImage
                image.src = TEnvironment.getProjectResource(currentName)+"?" + new Date().getTime();
                //displayImage(currentName);
            } else {
                if (appended) {
                    $domMain.fadeOut();
                    document.body.removeChild(domMain);
                    $(window).off('keydown', keyHandler);
                    appended = false;
                }
                if (imageDisplayed) {
                    $domImage.hide();
                    imageDisplayed = false;
                }
            }
        };
        
        var displayImage = function(name) {
            if (imageDisplayed) {
                $domImage.hide();
                //domMain.removeChild(domImage);
                imageDisplayed = false;
            }
            $domMain.addClass("loading");
            currentName = name;
            // init max dimensions: they will be set in onload
            $image.css("max-width","");
            $image.css("max-height","");
            image.src = TEnvironment.getProjectResource(name);
            $domTitle.text("");
        };
        
        var updateImageSize = function() {
            $image.css("max-width", $domImage.width());
            $image.css("max-height", $domImage.height());
        };
        
        var edit = function() {
            $domImage.hide();
            $domEditor.show();
            $domEditorImage.width(currentWidth);
            $domEditorImage.height(currentHeight);
            $domEditorImage.css("margin-left","-"+Math.round(currentWidth/2)+"px");
            $domEditorImage.css("margin-top","-"+Math.round(currentHeight/2)+"px");
            if (!editorInitialized) {
                $domEditorImage.wPaint({
                    path: TEnvironment.getBaseUrl()+TEnvironment.getConfig('wpaint-path'),
                    image:TEnvironment.getProjectResource(currentName)
                });
                editorInitialized = true;
            } else {
                $domEditorImage.wPaint('clear');
                $domEditorImage.wPaint('resize');
                $domEditorImage.wPaint('image', TEnvironment.getProjectResource(currentName));
            }
            imageDisplayed = false;
            imageEdited = true;
        };
        
        var message = function(text) {
            $domMessage.text(text).show().delay(2000).fadeOut();
        };
        
        this.displayed = function() {
            
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

