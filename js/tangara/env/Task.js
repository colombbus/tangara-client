define(['platform-pr', 'json'], function() {
    
    var Task = function(aFrame) {
        
        var frame = aFrame;
        
        this.showViews = function (views, callback) {
            if (views.forum || views.hint || views.editor) {
                //console.error("this task does not have forum, hint nor editor specific view, showing task view instead.");
                views.task = true;
            }
            $.each(['task', 'solution'], function (i, view) {
                if (views[view]) {
                    $('#' + view).show();
                } else {
                    $('#' + view).hide();
                }
            });
            if (typeof this.hackShowViews === 'function') {
                this.hackShowViews(views);
            }
            callback();
        };
        
        this.getViews = function(callback) {
            var views = {
                task: {},
                solution: {},
                hint: {requires: "task"},
                forum: {requires: "task"},
                editor: {requires: "task"}
            };
            callback(views);
        };
        
        this.updateToken = function (token, callback) {
            //console.warning("sorry, token system not available for this task");
            callback();
        };


        this.getHeight = function (callback) {
            callback(parseInt($("body").outerHeight(true)));
        };

        /*this.unload = function (callback) {
            if (typeof Tracker !== 'undefined') {
                Tracker.endTrackInputs();
            }
            callback();
        };*/

        this.getState = function (callback) {
            var res = {};
            this.getAnswer(function (displayedAnswer) {
                res.displayedAnswer = displayedAnswer;
            });
            callback(JSON.stringify(res));
        };

        this.reloadAnswer = function (strAnswer, callback) {
            frame.setCode(strAnswer);
            callback();
        };

        this.reloadState = function (state, callback) {
            var stateObject = JSON.parse(state);
            if (typeof stateObject.displayedAnswer !== 'undefined') {
                this.reloadAnswer(stateObject.displayedAnswer, callback);
            } else {
                callback();
            }
        };
    
        this.load = function (views, callback) {
            callback();
            this.reloadAnswer("", callback);
        };

        this.unload = function (callback) {
            callback();
        };

        this.getAnswer = function (callback) {
            callback(frame.getCode());
            /*i = 1;
            for(; i <= MAX_STEP && steps[i]; i++);
            code = editor.getStatements()[0];
            code = code === "undefined" ? "" : code.raw;
            callback(JSON.stringify(i) + "\n" + code);*/
        };
        
        this.getMetaData = function (callback) {
            alert("hooked on a feeling 5");
            var metaData = {
                id : "id",
                language : "language",
                version : 1.0,
                title : "title",
                authors : ["author 1"],
                license : "license",
                minWidth : 800
            };
            callback(metaData);
        };
    };
    
    return Task; 
});

