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

        this.getState = function (callback) {
            var res;
            this.getAnswer(function (displayedAnswer) {
                res = displayedAnswer;
            });
            callback(res);
        };

        this.reloadAnswer = function (strAnswer, callback) {
            try {
                var score = JSON.parse(strAnswer).score;
                var message = JSON.parse(strAnswer).message;
                var code = JSON.parse(strAnswer).code;
                frame.setScore(score); //really useful?
                frame.setMessage(message); //really useful?
                frame.setCode(code);
            } catch(e) {
                window.console.log(e);
            }
            callback();
        };

        this.reloadState = function (state, callback) {
            this.reloadAnswer(state, callback);
        };
        
    
        this.load = function (views, callback) {
            this.reloadAnswer("", callback);
        };

        this.unload = function (callback) {
            callback();
        };

        this.getAnswer = function (callback) {
            var text = '{"score":"' + frame.getScore()
                    + '", "message":"' + frame.getMessage()
                    + '", "code":"' + frame.getCode() + '"}';
            callback(text);
        };
        
        this.getMetaData = function (callback) {
            var link = document.location.href;
            var metaData = {
                id : link.substring(0, link.lastIndexOf("#")),
                language : "fr",
                version : 1.0,
                title : "title",
                authors : ["Colombbus - France-IOI"],
                license : "license",
                minWidth : 800,
                fullFeedback : true
            };
            callback(metaData);
        };
    };
    
    return Task; 
});

