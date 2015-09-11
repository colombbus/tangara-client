define(['platform-pr', 'json'], function() {
    
    var Task = function(aFrame) {
        
        var frame = aFrame;
        
        this.showViews = function(views, callback) {
            if (typeof views.task !== 'undefined' && views.task) {
                // show task view
                frame.displaySolution(false);
            } else if (typeof views.solution !== 'undefined' && views.solution) {
                // show solution
                frame.displaySolution(true);
            }
            callback();
        };
        
        this.getViews = function(callback) {
            var views = {
                task: {},
                solution: {},
                /*hint: {requires: "task"},
                forum: {requires: "task"},*/
                editor: {requires: "task"}
            };
            callback(views);
        };
        
        this.updateToken = function (token, callback) {
            //console.warning("sorry, token system not available for this task");
            callback();
        };


        this.getHeight = function (callback) {
            callback(800);
        };

        this.getState = function (callback) {
            callback(frame.getAnswer());
        };
        
        this.reloadState = function (state, callback) {
            frame.setAnswer(state);
            callback();
        };
        
        this.getAnswer = function (callback) {
            var res = JSON.stringify(
                {score : frame.getScore(),
                message : frame.getMessage(),
                code : frame.getLastSubmission()});
            callback(res);
        };
        
        this.reloadAnswer = function (strAnswer, callback) {
            if(strAnswer !== "") {
                try {
                    var answer = JSON.parse(strAnswer);
                    frame.setScore(answer.score);
                    frame.setMessage(answer.message);
                    frame.setCode(answer.code);
                } catch(e) {
                    window.console.log(e);
                }
            }
            else {
                frame.setScore(0);
                frame.setMessage("");
                frame.setCode("");
            }
            callback();
        };
    
        this.load = function (views, callback) {
            this.reloadAnswer("", callback);
        };

        this.unload = function (callback) {
            callback();
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
                minWidth : "auto",
                fullFeedback : true,
                autoHeight : true
            };
            callback(metaData);
        };
    };
    
    return Task; 
});

