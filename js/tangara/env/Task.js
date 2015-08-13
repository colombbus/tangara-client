define(['platform-pr', 'json'], function() {
    
    var Task = function(aFrame) {
        
        var frame = aFrame;
        
        this.showViews = function(views, callback) {
            //setInterval(function () { alert(frame.getSolution()); }, 1000);
            if(views.solution) {
                frame.displaySolution();
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
            callback(frame.getCode());
        };
        
        this.reloadState = function (state, callback) {
            frame.setCode(state);
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
                minWidth : 800,
                fullFeedback : true
            };
            callback(metaData);
        };
    };
    
    return Task; 
});

