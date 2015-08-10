define(['objects/teacher/Teacher', 'platform-pr', 'json'], function(Teacher) {
    function Grader() {
        
        var acceptedAnswers = null;
        
        this.getAcceptedAnswers = function () {
            if (this.acceptedAnswers) {
                return this.acceptedAnswers;
            }
            if (json && json.acceptedAnswers) {
                return json.acceptedAnswers;
            }
        };
        
        /*this.gradeTask = function (answer, answerToken, callback) {
            var acceptedAnswers = this.getAcceptedAnswers();
            var taskParams = platform.getTaskParams();
            var score = taskParams.noScore;
            if (acceptedAnswers && acceptedAnswers[0]) {
                if ($.inArray("" + answer, acceptedAnswers) > -1) {
                    score = taskParams.maxScore;
                } else {
                    score = taskParams.minScore;
                }
            }
            callback(score, "");
        }*/

        var answersFromStrAnswer = function (strAnswer) {
            var r = [];
            if (strAnswer !== "")
                r = $.parseJSON(strAnswer);
            return r;
        };

        //due to the impossibility to simply evaluate the code
        this.gradeTask = function (strAnswer, token, callback) {
            /*var taskParams = platform.getTaskParams();
            var answers = answersFromStrAnswer(strAnswer);
            callback(taskParams.noScore, "Mkay");*/
            //if(teacher.taskValidated())
                callback(Teacher.getScore(), Teacher.getMessage());
                //callback(taskParams.noScore, Teacher.getMessage());
            
        };           
        
    }
    return Grader; 
});

