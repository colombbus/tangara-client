define(['jquery','TLearnCanvas', 'TLearnEditor', 'TLearnLog', 'TRuntime', 'TEnvironment', 'TParser', 'objects/learn/Learn'], function($, TCanvas, TEditor, TLog, TRuntime, TEnvironment, TParser, Learn) {
    function TLearnFrame() {
        var initialized = false;
        var domFrame = document.createElement("div");
        domFrame.id = "tlearnframe";
        var mainFrame = document.createElement("div");
        mainFrame.id = "tlearnframe-main";

        var leftDiv = document.createElement("div");
        leftDiv.id = "tlearnframe-left";
        var stepsDiv = document.createElement("div");
        stepsDiv.id = "tlearnframe-steps";
        leftDiv.appendChild(stepsDiv);
        var lessonDiv = document.createElement("div");
        lessonDiv.id = "tlearnframe-lesson";
        
        var lessonH2 = document.createElement("h2");
        var lessonTitle = "Instructions";
        lessonH2.appendChild(document.createTextNode(lessonTitle));
        lessonDiv.appendChild(lessonH2);
        var lessonContent = document.createElement("div");
        lessonContent.id = "tlearnframe-instructions";
        lessonDiv.appendChild(lessonContent);
        leftDiv.appendChild(lessonDiv);
        
        var rightDiv = document.createElement("div");
        rightDiv.id = "tlearnframe-right";
        
        // Add Canvas
        var canvasDiv = document.createElement("div");
        canvasDiv.id = "tlearnframe-canvas";
        var canvas = new TCanvas();
        canvasDiv.appendChild(canvas.getElement());
        var messageDiv = document.createElement("div");
        messageDiv.id = "tlearnframe-message";
        var messageContentDiv = document.createElement("div");
        messageContentDiv.id = "tlearnframe-message-content";
        var closeMessage = document.createElement("a");
        closeMessage.id = "tlearnframe-message-close";
        closeMessage.href="#";
        closeMessage.onclick = function() {
            $("#tlearnframe-message").fadeOut(500);
        };
        messageDiv.appendChild(closeMessage);
        messageDiv.appendChild(messageContentDiv);
        //$(messageDiv).css("display", "none");
        canvasDiv.appendChild(messageDiv);
        var $messageDiv = $(messageDiv);
        var $messageContentDiv = $(messageContentDiv);
        rightDiv.appendChild(canvasDiv);
        /*Img = document.createElement("img");
        loadingImg.src = TEnvironment.getBaseUrl() + "/images/loader2.gif";
        loadingDiv.appendChild(loadingImg);
        canvasDiv.appendChild(loadingDiv)*/
        var bottomDiv = document.createElement("div");
        bottomDiv.id = "tlearnframe-bottom";
        
        var buttonsDiv = document.createElement("div");
        buttonsDiv.id = "tlearnframe-buttons";
        var buttonExecute = document.createElement("button");
        buttonExecute.className = "ttoolbar-button ttoolbar-button-execute";
        var imageExecute = document.createElement("img");
        imageExecute.src = TEnvironment.getBaseUrl() + "/images/play_orange.png";
        imageExecute.className = "ttoolbar-button-image";
        buttonExecute.appendChild(imageExecute);
        buttonExecute.appendChild(document.createTextNode(TEnvironment.getMessage('button-execute')));
        buttonsDiv.appendChild(buttonExecute);

        var buttonClear = document.createElement("button");
        buttonClear.className = "ttoolbar-button ttoolbar-button-clear";
        var imageClear = document.createElement("img");
        imageClear.src = TEnvironment.getBaseUrl() + "/images/reset.png";
        imageClear.className = "ttoolbar-button-image";
        buttonClear.appendChild(imageClear);
        buttonClear.appendChild(document.createTextNode("Réinitialiser"));
        buttonsDiv.appendChild(buttonClear);
        
        bottomDiv.appendChild(buttonsDiv);
        
        // Add Editor
        var editor = new TEditor();
        bottomDiv.appendChild(editor.getElement());
        
        rightDiv.appendChild(bottomDiv);
        
        mainFrame.appendChild(leftDiv);
        mainFrame.appendChild(rightDiv);
        
        domFrame.appendChild(mainFrame);
        
        var creditsFrame = document.createElement("div");
        creditsFrame.id = "tlearnframe-credits";

        $(creditsFrame).html("Declick beta - &copy; <a href='http://www.colombbus.org' target='_blank'>Colombbus</a> 2015");

        domFrame.appendChild(creditsFrame);

        var log = new TLog();
        var startStatements;
        var checkStatements;
        // Plug Runtime with Canvas and Log
        TRuntime.setCanvas(canvas);
        TRuntime.setLog(log);
        Learn.setFrame(this);
        log.setFrame(this);
        var step = 1;
        var MAX_STEP = 2;
        
        this.getElement = function() {
            return domFrame;
        };
        
        this.displayed = function() {
            canvas.displayed();
            editor.displayed();
            initialized = true;
            var frame = this;
            buttonExecute.onclick = function() { frame.execute(); };
            buttonClear.onclick = function() { frame.clear(); };
        };
        
        this.init = function() {
            $("#tcanvas").css('visibility', 'visible');
            canvas.removeLoading();
        };
        
        this.execute = function() {
            this.hideMessage();
            try {
                var statements = editor.getStatements();
                TRuntime.executeStatements(statements);
                //TODO: only if no error
                Learn.setStatements(editor.getStatements());
                if (checkStatements) {
                    TRuntime.executeStatements(checkStatements);
                }
            } catch(e) {
                try  {
                    log.addError(e);
                } catch (f) {
                    this.showError("Unhandled error: "+f);
                }
            }
        };
        
        this.clear = function() {
            this.hideMessage();
            TRuntime.clear();
            if (startStatements) {
                TRuntime.executeStatements(startStatements);
            }
        };
        
        this.validateStep = function() {
            window.alert("bravo !");
            step++;
            if (step <= MAX_STEP) {
                this.loadStep(step);
            }
        };
        
        this.invalidateStep = function(message) {
            this.showMessage(message);
        };
        
        this.showError = function(message) {
            $messageContentDiv.text(message);
            $messageDiv.addClass("tlearnframe-error");
            $messageDiv.show();
        };

        this.showMessage = function(message) {
            $messageContentDiv.text(message);
            $messageDiv.addClass("tlearnframe-message");
            $messageDiv.show();
        };
        
        this.hideMessage = function() {
            $messageDiv.hide();
            $messageDiv.removeClass("tlearnframe-error");
            $messageDiv.removeClass("tlearnframe-message");
        };
        
        this.loadStep = function(number) {
            console.log("loading step #"+number);
            TRuntime.clear();
            editor.clear();
            startStatements = false;
            checkStatements = false;
            // load instructions
            $.ajax({
                dataType: "text",
                url: TEnvironment.getResource("steps/"+number+"/instructions.html"),
                global:false,
                async: true,
                success: function(data) {
                    $("#tlearnframe-instructions").html(data);
                },
                error: function(data, status, error) {
                    window.console.log("Error loading instruction file for step #"+number);
                }
            });
            // load start statements
            $.ajax({
                dataType: "text",
                url: TEnvironment.getResource("steps/"+number+"/start.code"),
                global:false,
                async: true,
                success: function(data) {
                    try {
                        startStatements = TParser.parse(data);
                        TRuntime.executeStatements(startStatements);
                    } catch (e) {
                        console.log("Error parsing start script\n"+e);
                    }
                },
                error: function(data, status, error) {
                    window.console.log("Error loading start script for step #"+number);
                }
            });
            
            // load check statement
            $.ajax({
                dataType: "text",
                url: TEnvironment.getResource("steps/"+number+"/check.code"),
                global:false,
                async: true,
                success: function(data) {
                    try {
                        checkStatements = TParser.parse(data);
                    } catch (e) {
                        console.log("Error parsing check script\n"+e);
                    }
                },
                error: function(data, status, error) {
                    window.console.log("Error loading check script for step #"+number);
                }
            });
            
            
        };


    }
    
    return TLearnFrame;
});
