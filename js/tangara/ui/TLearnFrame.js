define(['ui/TComponent', 'jquery', 'ui/TLearnCanvas', 'ui/TLearnEditor', 'TRuntime', 'TEnvironment', 'TParser', 'TExercise', 'TError', 'platform-pr', 'miniPlatform'], function(TComponent, $, TLearnCanvas, TLearnEditor, TRuntime, TEnvironment, TParser, TExercise, TError) {
    function TLearnFrame(callback) {
        var $lesson, $lessonContent, $message, $messageContent, $instructions;
        var canvas, editor;

        var lessonHTML;

        var bottomLesson = 0;/*207;*/
        
        var exercise = new TExercise();
        
        var lastSubmission = "";
        
        TComponent.call(this, "TLearnFrame.html", function(component) {
            $lesson = component.find("#tlearnframe-lesson");
            $lesson.find("#tlearnframe-lesson-congrats").text("Bravo !");
            $lessonContent = component.find("#tlearnframe-lesson-content");
            $message = component.find("#tlearnframe-message");
            $messageContent = component.find("#tlearnframe-message-content");
            var $messageClose = component.find("#tlearnframe-message-close");
            $messageClose.click(function(e) {
                $message.fadeOut(500);
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
                    if (typeof callback !== 'undefined') {
                        callback.call(self, component);
                    }
                });
            });

        });

        this.displayed = function() {
            canvas.displayed();
            editor.displayed();
            exercise.setFrame(this);
            // declare itself as log 
            TRuntime.setLog(this);
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
        };

        var execute = function() {
            hideMessage();
            clear();
            try {
                if(exercise.isParserMode()) {
                    var statements = editor.getValue();
                }
                else {
                    var statements = editor.getStatements();
                    TRuntime.executeStatements(statements);
                }
                //TODO: only if no error
                lastSubmission = editor.getValue();
                exercise.check(statements);
            } catch (err) {
                var error;
                if (!(err instanceof TError)) {
                    error = new TError(err);
                    error.detectError();
                } else {
                    error = err;
                }
                showError(error.getMessage());
            }
        };

        var clear = function() {
            hideMessage();
            TRuntime.clear();
            exercise.init();
        };

        var validateStep = function(message) {
            if(typeof message === "undefined" || message === "") {
                message = "Bravo, vous avez réussi !";
            }
            showMessage(message);
        };

        var invalidateStep = function(message) {
            showMessage(message);
        };

        this.validateStep = function(message) {
            platform.validate("next");
            showMessage(message);
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

        this.loadExercise = function(id) {
            if ($lesson.is(":visible")) {
                closeLesson();
            }
            if ($message.is(":visible")) {
                hideMessage();
            }
            TRuntime.clear();
            editor.clear();
            exercise.setId(id);
            exercise.load(function() {
                // set instruction
                if (exercise.hasInstructions()) {
                    exercise.getInstructions(function(data) {
                        $instructions.html(data);
                        exercise.init();
                    });                    
                } else {
                    exercise.init();
                }                
            });
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
        
        /*due to the fact that some functions have to get through
         * the editor before atteining Teacher, no direct appeal
         * to Teacher are done here; there are all get through
         * the editor
         */
        
        /**
         * Get the last submission
         * @returns {string}
         */
        this.getLastSubmission = function() {
            return lastSubmission;
        };
        
        /**
         * Get the code unparsed
         * @returns {string}
         */
        this.getCode = function() {
            return editor.getValue();
        };
        
        /**
         * Set the code in the editor
         * @param {string} value
         */
        this.setCode = function(value) {
            editor.setValue(value);
        };
        
        /**
         * Get the score
         * @returns {number}
         */
        this.getScore = function() {
            return exercise.getScore();
        };
        
        /**
         * Set the score
         * @param {number} value
         */
        this.setScore = function(value) {
            return exercise.setScore(value);
        };
        
        /**
         * Get the message
         * @returns {string}
         */
        this.getMessage = function() {
            return exercise.getMessage();
        };
        
        /**
         * Set the message
         * @param {string} value
         * @returns {unresolved}
         */
        this.setMessage = function(value) {
            return exercise.setMessage(value);
        };
        // LOG MANAGEMENT
        
        this.addError = function(error) {
            showError(error.getMessage());
        };

        this.addCommand = function(command) {
            // do nothing
        };


    }

    TLearnCanvas.prototype = Object.create(TComponent.prototype);
    TLearnCanvas.prototype.constructor = TLearnCanvas;

    return TLearnFrame;
});
