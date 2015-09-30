define(['ui/TComponent', 'jquery', 'split-pane', 'ui/TLearnCanvas', 'ui/TLearnEditor', 'TRuntime', 'TEnvironment', 'TParser', 'TExercise', 'TError', 'platform-pr'], function(TComponent, $, SplitPane, TLearnCanvas, TLearnEditor, TRuntime, TEnvironment, TParser, TExercise, TError) {
    function TLearnFrame(callback) {
        var $text, $message, $textMessage, $textMessageContent, $messageContent, $instructions, $solution, $solutionContent, $input, $loading, $right;
        var canvas, editor;

        var exercise = new TExercise();
        
        var lastSubmission = "";
        
        var bottomSolution = 0;
        
        var textMode = false;
        
        TComponent.call(this, "TLearnFrame.html", function(component) {
            $text = component.find("#tlearnframe-text");
            $input = $text.find("#tlearnframe-text-input");
            $message = component.find("#tlearnframe-message");
            $messageContent = component.find("#tlearnframe-message-content");
            $textMessage = component.find("#tlearnframe-text-message");
            $textMessageContent = component.find("#tlearnframe-text-message-content");
            var $messageClose = component.find("#tlearnframe-message-close");
            $messageClose.click(function(e) {
                $message.fadeOut(500);
            });
            var $textMessageClose = component.find("#tlearnframe-text-message-close");
            $textMessageClose.click(function(e) {
                $textMessage.fadeOut(500);
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
            var $buttonErase = component.find(".ttoolbar-button-erase");
            $buttonErase.append(TEnvironment.getMessage('button-erase'));
            $buttonErase.click(function(e) {
                clear();
            });
            var $buttonCheck = component.find(".ttoolbar-button-check");
            $buttonCheck.append(TEnvironment.getMessage('button-check'));
            $buttonCheck.click(function(e) {
                execute();
            });
            $instructions = component.find("#tlearnframe-instructions");
            $solution = component.find("#tlearnframe-solution");
            $solution = component.find("#tlearnframe-solution");
            $solutionContent = component.find("#tlearnframe-solution-content");
            
            $loading = component.find("#tlearnframe-loading");
            
            $right = component.find("#tlearnframe-right");
            
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
            $right.on("splitpane:resized", function() {
                editor.resize();
            });
            $('.split-pane').splitPane();
            // declare itself as log 
            TRuntime.setLog(this);
        };

        this.init = function() {
            var height = $solution.height();
            $solution.css('top', -height + "px");
            $solution.css('bottom', height + bottomSolution + "px");
            $solution.css('visibility', 'visible');
            $solution.hide();
            $loading.fadeOut(1000, function() {
                $(this).remove();
            });            
            canvas.removeLoading();
        };

        var execute = function() {
            hideMessage();
            if (!textMode) {
                clear();
            }
            try {
                var value;
                if(textMode) {
                    value = $input.val();
                    lastSubmission = value;
                } else {
                    value = editor.getStatements();
                    lastSubmission = editor.getValue();
                    TRuntime.executeStatements(value);
                }
                //TODO: only if no error
                exercise.check(value);
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
            if (textMode) {
                // clear editor value
                $input.val("");
                // clear code editor value as well since setTextMode will copy value
                editor.setValue("");
            } else {
                // clear runtime
                TRuntime.clear();
            }
            exercise.init();
        };

        var validateStep = function(message) {
            if(typeof message === "undefined" || message === "") {
                message = "Bravo, tu as réussi !";
            }
            showMessage(message);
        };

        var invalidateStep = function(message) {
            showMessage(message);
        };

        this.validateStep = function(message) {
            try {
                platform.validate("next");
            } catch (e) {
                console.error("Error validating step");
                console.debug(e);
            }
            validateStep(message);
        };

        this.invalidateStep = function(message) {
            invalidateStep(message);
        };

        var showError = function(message) {
            if (textMode) {
                $textMessageContent.text(message);
                $textMessage.addClass("tlearnframe-error");
                $textMessage.show();
            } else {
                $messageContent.text(message);
                $message.addClass("tlearnframe-error");
                $message.show();
            }
        };

        var showMessage = function(message) {
            if (textMode) {
                $textMessageContent.text(message);
                $textMessage.addClass("tlearnframe-message");
                $textMessage.show();
            } else {
                $messageContent.text(message);
                $message.addClass("tlearnframe-message");
                $message.show();
            }
        };

        var hideMessage = function() {
            $message.hide();
            $message.removeClass("tlearnframe-error");
            $message.removeClass("tlearnframe-message");
            $textMessage.hide();
            $textMessage.removeClass("tlearnframe-error");
            $textMessage.removeClass("tlearnframe-message");
        };

        this.loadExercise = function(id, callback) {
            if ($solution.is(":visible")) {
                closeSolution();
            }
            if ($message.is(":visible") || $textMessage.is(":visible")) {
                hideMessage();
            }
            // by default: program mode
            this.setProgramMode();
            TRuntime.clear();
            editor.clear();
            $input.val();
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
                // TODO: send callback to exercise.init() when interpreter supports callbacks
                if (typeof callback !== 'undefined') {
                    callback.call(this);
                }
            }, id);
        };


        var openSolution = function(solutionHTML) {
            $solutionContent.html(solutionHTML);
            $solution.show().stop().animate({top: "0px", bottom: bottomSolution + "px"}, 600);
        };

        var closeSolution = function() {
            var height = $solution.height();
            $solution.stop().animate({top: -height + "px", bottom: height + bottomSolution + "px"}, 600, function() {
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
         * Get the value of text input
         * @returns {string}
         */
        this.getText = function() {
            return $input.val();
        };
        
        
        /**
         * Get the answer entered by user
         * @returns {string}
         */
        this.getAnswer = function() {
            if (textMode) {
                return this.getText();
            } else {
                return this.getCode();
            }
        };
        
        /**
         * Set the code in the editor
         * @param {string} value
         */
        this.setCode = function(value) {
            editor.setValue(value);
        };
        
        /**
         * Set the value of text editor
         * @param {string} value
         */
        this.setText = function(value) {
            $input.val(value);
        };
        
        /**
         * Set the value of user's answer
         * @param {string} value
         */        
        this.setAnswer = function(value) {
            if (textMode) {
                this.setText(value);
            } else {
                this.setCode(value);
            }
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
        
        /**
         * Get the message
         * @returns {string}
         */
        this.getSolution = function() {
            return exercise.getSolution();
        };
        
        /**
         * Display or hide the solution
         * @param {boolean} display or hide the solution
         */
        this.displaySolution = function(display) {
            if (exercise.hasSolution() && display) {
                openSolution(exercise.getSolution());
            } else {
                closeSolution();
            }
        };
        
        this.setTextMode = function() {
            // copy current value if any
            this.setText(this.getCode());
            $text.show();
            textMode = true;
        };

        this.setProgramMode = function() {
            $text.hide();
            textMode = false;
        };

        
        // LOG MANAGEMENT
        
        this.addError = function(error) {
            showError(error.getMessage());
        };

        this.addCommand = function(command) {
            // do nothing
        };


    }

    TLearnFrame.prototype = Object.create(TComponent.prototype);
    TLearnFrame.prototype.constructor = TLearnFrame;

    return TLearnFrame;
});
