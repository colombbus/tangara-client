define(['ui/TComponent', 'jquery', 'ui/TLearnCanvas', 'ui/TLearnEditor', 'TRuntime', 'TEnvironment', 'TParser', 'objects/teacher/Teacher'], function(TComponent, $, TLearnCanvas, TLearnEditor, TRuntime, TEnvironment, TParser, Teacher) {
    function TLearnFrame(callback) {
        var MAX_STEP = 4;
        var steps = [];

        var $lesson, $lessonContent, $steps, $message, $messageContent, $buttonPrevious, $buttonNext, $instructions;
        var canvas, editor;

        var startStatements;
        var checkStatements;
        var lessonHTML;

        var step = 1;
        var bottomLesson = 0;/*207;*/

        var frame = this;

        TComponent.call(this, "TLearnFrame.html", function(component) {
            $lesson = component.find("#tlearnframe-lesson");
            $lesson.find("#tlearnframe-lesson-congrats").text("Bravo !");
            $lessonContent = component.find("#tlearnframe-lesson-content");
            $steps = component.find("#tlearnframe-steps");
            $message = component.find("#tlearnframe-message");
            $messageContent = component.find("#tlearnframe-message-content");
            var $messageClose = component.find("#tlearnframe-message-close");
            $messageClose.click(function(e) {
                $message.fadeOut(500);
            });
            $buttonPrevious = component.find(".ttoolbar-button-previous");
            $buttonPrevious.append(TEnvironment.getMessage('button-previous'));
            $buttonPrevious.click(function(e) {
                loadStep(step - 1);
            });
            $buttonNext = component.find(".ttoolbar-button-next");
            $buttonNext.prepend(TEnvironment.getMessage('button-next'));
            $buttonNext.click(function(e) {
                loadStep(step + 1);
            });
            var $buttonClear = component.find(".ttoolbar-button-clear");
            $buttonClear.append("Réinitialiser");
            $buttonClear.click(function(e) {
                clear();
            });
            var $buttonExecute = component.find(".ttoolbar-button-execute");
            $buttonExecute.append(TEnvironment.getMessage('button-execute'));
            $buttonExecute.click(function(e) {
                execute();
            });
            $instructions = component.find("#tlearnframe-instructions");

            var self = this;
            canvas = new TLearnCanvas(function(c) {
                component.find("#TLearnCanvas").replaceWith(c);
                editor = new TLearnEditor(function(d) {
                    component.find("#TLearnEditor").replaceWith(d);
                    // Plug Runtime with Canvas and Teacher with frame
                    TRuntime.setCanvas(canvas);
                    Teacher.setFrame(frame);
                    if (typeof callback !== 'undefined') {
                        callback.call(self, component);
                    }
                })
            });

        });

        this.displayed = function() {
            canvas.displayed();
            editor.displayed();
            initialized = true;
        };


        this.init = function() {
            var height = $lesson.height();
            $lesson.css('top', -height + "px");
            $lesson.css('bottom', height + bottomLesson + "px");
            $lesson.css('visibility', 'visible');
            $lesson.hide();
            $("#tcanvas").css('visibility', 'visible');
            canvas.removeLoading();
            function getStepHandler(number) {
                return function() {
                    if (steps[number]) {
                        loadStep(number);
                    }
                };
            }
            ;
            for (var i = 1; i <= MAX_STEP; i++) {
                steps[i] = false;
                var domStep = document.createElement("a");
                domStep.className = "tlearnframe-step";
                domStep.id = "tlearnframe-step-" + i;
                domStep.href = "#";
                domStep.onclick = getStepHandler(i);
                $steps.append(domStep);
            }
        };

        var execute = function() {
            hideMessage();
            try {
                var statements = editor.getStatements();
                TRuntime.executeStatements(statements);
                //TODO: only if no error
                Teacher.setStatements(editor.getStatements());
                if (checkStatements) {
                    TRuntime.executeStatements(checkStatements);
                }
            } catch (error) {
                var code, message;
                if (typeof error.getCode !== 'undefined') {
                    code = error.getCode();
                }
                if (typeof error.getMessage !== 'undefined') {
                    message = error.getMessage();
                } else if (typeof error.message !== 'undefined') {
                    message = error.message;
                } else {
                    message = 'undefined error';
                }
                if (typeof message === 'string') {
                    showError(message)
                }
            }
        };

        var clear = function() {
            hideMessage();
            TRuntime.clear();
            if (startStatements) {
                TRuntime.executeStatements(startStatements);
            }
        };

        var validateStep = function() {
            $("#tlearnframe-step-" + step).addClass("tlearnframe-step-ok");
            steps[step] = true;
            if (step < MAX_STEP) {
                $buttonNext.show();
            }
            openLesson();
        };

        var invalidateStep = function(message) {
            showMessage(message);
        };

        this.validateStep = function() {
            validateStep();
        };

        this.invalidateStep = function(message) {
            invalidateStep(message);
        };

        var showError = function(message) {
            $messageContent.text(message);
            $message.addClass("tlearnframe-error");
            $message.show();
        };

        var showMessage = function(message) {
            $messageContent.text(message);
            $message.addClass("tlearnframe-message");
            $message.show();
        };

        var hideMessage = function() {
            $message.hide();
            $message.removeClass("tlearnframe-error");
            $message.removeClass("tlearnframe-message");
        };

        var loadStep = function(number) {
            if ($lesson.is(":visible")) {
                closeLesson();
            }
            if ($message.is(":visible")) {
                hideMessage();
            }
            console.log("loading step #" + number);
            window.console.log("clearing TRuntime");
            TRuntime.clear();
            window.console.log("clearing Editor");
            editor.clear();
            window.console.log("ok");

            startStatements = false;
            checkStatements = false;
            // load instructions
            $.ajax({
                dataType: "text",
                url: TEnvironment.getResource("steps/" + number + "/instructions.html"),
                global: false,
                async: true,
                success: function(data) {
                    $instructions.html(data);
                },
                error: function(data, status, error) {
                    window.console.log("Error loading instruction file for step #" + number);
                }
            });
            // load start statements
            $.ajax({
                dataType: "text",
                url: TEnvironment.getResource("steps/" + number + "/start.code"),
                global: false,
                async: true,
                success: function(data) {
                    try {
                        startStatements = TParser.parse(data);
                        TRuntime.executeStatements(startStatements);
                    } catch (e) {
                        console.log("Error parsing start script\n" + e);
                    }
                },
                error: function(data, status, error) {
                    window.console.log("Error loading start script for step #" + number);
                }
            });

            // load check statement
            $.ajax({
                dataType: "text",
                url: TEnvironment.getResource("steps/" + number + "/check.code"),
                global: false,
                async: true,
                success: function(data) {
                    try {
                        checkStatements = TParser.parse(data);
                    } catch (e) {
                        console.log("Error parsing check script\n" + e);
                    }
                },
                error: function(data, status, error) {
                    // no check: validate level
                    checkStatements = false;
                    $("#tlearnframe-step-" + number).addClass("tlearnframe-step-ok");
                    steps[number] = true;
                    if (number < MAX_STEP) {
                        $buttonNext.show();
                    }
                }
            });

            // load lesson HTML
            $.ajax({
                dataType: "text",
                url: TEnvironment.getResource("steps/" + number + "/lesson.html"),
                global: false,
                async: true,
                success: function(data) {
                    lessonHTML = data;
                },
                error: function(data, status, error) {
                    window.console.log("Error loading lesson HTML for step #" + number);
                    lessonHTML = "";
                }
            });

            $("#tlearnframe-step-" + step).removeClass("tlearnframe-step-current");
            step = number;
            TEnvironment.getProject().setStep(step);
            $("#tlearnframe-step-" + step).addClass("tlearnframe-step-current");
            if (step > 1) {
                $buttonPrevious.show();
            } else {
                $buttonPrevious.hide();
            }
            if (step < MAX_STEP && steps[step]) {
                $buttonNext.show();
            } else {
                $buttonNext.hide();
            }
        };

        this.loadStep = function(number) {
            loadStep(number);
        };

        var openLesson = function() {
            $lessonContent.html(lessonHTML);
            $lesson.show().stop().animate({top: "0px", bottom: bottomLesson + "px"}, 600);
        };

        var closeLesson = function() {
            var height = $lesson.height();
            $lesson.stop().animate({top: -height + "px", bottom: height + bottomLesson + "px"}, 600, function() {
                $(this).hide();
            });
        };

    }

    TLearnCanvas.prototype = Object.create(TComponent.prototype);
    TLearnCanvas.prototype.constructor = TLearnCanvas;

    return TLearnFrame;
});
