define(['jquery','TLearnCanvas', 'TLearnEditor', 'TLearnLog', 'TRuntime', 'TEnvironment', 'TParser', 'objects/learn/Learn'], function($, TCanvas, TEditor, TLog, TRuntime, TEnvironment, TParser, Learn) {
    function TLearnFrame() {
        var MAX_STEP = 4;
        var steps = [];
        
        
        var domFrame = document.createElement("div");
        domFrame.id = "tlearnframe";
        var mainFrame = document.createElement("div");
        mainFrame.id = "tlearnframe-main";

        var leftDiv = document.createElement("div");
        leftDiv.id = "tlearnframe-left";
        var stepsDiv = document.createElement("div");
        stepsDiv.id = "tlearnframe-steps";
       
        leftDiv.appendChild(stepsDiv);
        var instructionDiv = document.createElement("div");
        instructionDiv.id = "tlearnframe-instruction";
        
        var instructionContent = document.createElement("div");
        instructionContent.id = "tlearnframe-instructions";
        instructionDiv.appendChild(instructionContent);

        var instructionNav = document.createElement("div");
        instructionNav.id = "tlearnframe-navigation";
        var buttonPrevious = document.createElement("button");
        buttonPrevious.className = "ttoolbar-button ttoolbar-button-previous";
        var imagePrevious = document.createElement("img");
        imagePrevious.src = TEnvironment.getBaseUrl() + "/images/play_orange_inverted.png";
        imagePrevious.className = "ttoolbar-button-image";
        buttonPrevious.appendChild(imagePrevious);
        buttonPrevious.appendChild(document.createTextNode(TEnvironment.getMessage('button-previous')));
        instructionNav.appendChild(buttonPrevious);
        var buttonNext = document.createElement("button");
        buttonNext.className = "ttoolbar-button ttoolbar-button-next";
        var imageNext = document.createElement("img");
        imageNext.src = TEnvironment.getBaseUrl() + "/images/play_orange.png";
        imageNext.className = "ttoolbar-button-image";
        buttonNext.appendChild(document.createTextNode(TEnvironment.getMessage('button-next')));
        buttonNext.appendChild(imageNext);
        instructionNav.appendChild(buttonNext);
        
        instructionDiv.appendChild(instructionNav);
        
        leftDiv.appendChild(instructionDiv);
        
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
        
        var lessonDiv = document.createElement("div");
        lessonDiv.id = "tlearnframe-lesson";
        var $lesson = $(lessonDiv);
        var lessonCongratsDiv = document.createElement("div");
        lessonCongratsDiv.id = "tlearnframe-lesson-congrats";
        $(lessonCongratsDiv).text("Bravo !");
        lessonDiv.appendChild(lessonCongratsDiv);
        var lessonContentDiv = document.createElement("div");
        lessonContentDiv.id = "tlearnframe-lesson-content";
        var $lessonContent = $(lessonContentDiv);
        lessonDiv.appendChild(lessonContentDiv);
        rightDiv.appendChild(lessonDiv);
        
        
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
        var lessonHTML;
        // Plug Runtime with Canvas and Log
        TRuntime.setCanvas(canvas);
        TRuntime.setLog(log);
        Learn.setFrame(this);
        log.setFrame(this);
        var step = 1;
        var bottomLesson = 0;/*207;*/
        
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
            buttonPrevious.onclick = function() { frame.loadStep(step-1); };
            buttonNext.onclick = function() { frame.loadStep(step+1); };
        };
        
        
        this.init = function() {
            var height = $lesson.height();
            $lesson.css('top',-height+"px");
            $lesson.css('bottom',height+bottomLesson+"px");
            $lesson.css('visibility', 'visible');
            $lesson.hide();
            $("#tcanvas").css('visibility', 'visible');
            canvas.removeLoading();
            var frame = this;
            function getStepHandler(number) {
                return function() {
                    if (steps[number]) {
                        frame.loadStep(number);
                    }
                };
            };
            for (var i=1; i<=MAX_STEP;i++) {
                steps[i] = false;
                var domStep = document.createElement("a");
                domStep.className = "tlearnframe-step";
                domStep.id = "tlearnframe-step-"+i;
                domStep.href="#";
                domStep.onclick = getStepHandler(i);
                stepsDiv.appendChild(domStep);
            }
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
            $("#tlearnframe-step-"+step).addClass("tlearnframe-step-ok");
            steps[step] = true;
            if (step < MAX_STEP) {
                $(buttonNext).show();
            }
            this.openLesson();
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
            if ($lesson.is(":visible")) {
                this.closeLesson();
            }
            if ($messageDiv.is(":visible")) {
                this.hideMessage();
            }
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
                    // no check: validate level
                    checkStatements = false;
                    $("#tlearnframe-step-"+number).addClass("tlearnframe-step-ok");
                    steps[number] = true;
                    if (number < MAX_STEP) {
                        $(buttonNext).show();
                    }
                }
            });

            // load lesson HTML
            $.ajax({
                dataType: "text",
                url: TEnvironment.getResource("steps/"+number+"/lesson.html"),
                global:false,
                async: true,
                success: function(data) {
                    lessonHTML = data;
                },
                error: function(data, status, error) {
                    window.console.log("Error loading lesson HTML for step #"+number);
                    lessonHTML = "";
                }
            });
            
            $("#tlearnframe-step-"+step).removeClass("tlearnframe-step-current");
            step = number;
            TEnvironment.getProject().setStep(step);
            $("#tlearnframe-step-"+step).addClass("tlearnframe-step-current");
            if (step>1) {
                $(buttonPrevious).show();
            } else {
                $(buttonPrevious).hide();
            }
            if (step < MAX_STEP && steps[step]) {
                $(buttonNext).show();
            } else {
                $(buttonNext).hide();
            }
        };
        
        this.openLesson = function() {
            $lessonContent.html(lessonHTML);
            $lesson.show().stop().animate({top:"0px", bottom:bottomLesson+"px"}, 600);
        };

        this.closeLesson = function() {
            var height = $lesson.height();
            $lesson.stop().animate({top:-height+"px", bottom:height+bottomLesson+"px"}, 600, function(){$(this).hide();});
        };

    }
    
    return TLearnFrame;
});
