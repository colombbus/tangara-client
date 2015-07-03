define(['jquery', 'TEnvironment', 'utils/TUtils', 'TGraphicalObject', 'objects/text/Text'], function ($, TEnvironment, TUtils, TGraphicalObject, Text) {
    var Score = function (string) {
        if (typeof string === 'undefined') {
            string = "Score : ";
        }
        var displayedText = string + this.score;
        Text.call(this, displayedText);
    };

    Score.prototype = Object.create(Text.prototype);
    Score.prototype.constructor = Score;
    Score.prototype.className = "Score";
    Score.prototype.label = "Score : ";
    Score.prototype.score = 0;

    /**
     * Erase ScoreNumber to 0
     * 
     */
    Score.prototype._eraseScoreNumber = function () {
        this.score = 0;
        this._setText(this.label + this.score);
    };

    /**
     * Increase ScoreNumber with step defined
     * Default step is 1
     * 
     * @param step number (default: 1)
     */
    Score.prototype._increaseScore = function (step) {
        if (typeof step === 'undefined') {
            step = 1;
        }
        this.score += TUtils.getInteger(step);
        this._setText(this.label + this.score);
    };

    /**
     * Decrease ScoreNumber with integer step defined
     * Default step is 1
     * 
     * @param step number (default: 1)
     */
    Score.prototype._decreaseScore = function (step) {
        if (typeof step === 'undefined') {
            step = 1;
        }
        this.score -= TUtils.getInteger(step);
        this._setText(this.label + this.score);
    };

    /**
     * Defines a string label displayed before score number
     * Default string is "Score : "
     * 
     * @param label string the first part of the score (default: "Score : ")
     */
    Score.prototype._setLabel = function (label) {
        if (typeof label === 'undefined') {
            this.label = "Score : ";
        }
        else
            this.label = label;
        this._setText(this.label + this.score);
    };

    /**
     * Defines ScoreNumber with integer given
     * Default is 0
     * 
     * @param number string the first part of the score (default: "Score : ")
     */
    Score.prototype._setScoreNumber = function (number) {
        this.score = TUtils.getInteger(number);
        this._setText(this.label + this.score);
    };

    /**
     * Get Label
     * 
     * @returns string Contains the Label
     */
    Score.prototype._getLabel = function () {
        var string = this.label;
        return string;
    };

    /**
     * Get Score Number
     * @returns string Contains the ScoreNumber
     */
    Score.prototype._getScoreNumber = function () {
        var string = this.score + ""; // "" to convert in string
        return string;
    };
    /**
     * Get Score 
     * 
     * @returns string Contains the label and the score number defined in
     * Score
     */
    Score.prototype._getScore = function () {
        var string = this.label + this.score;
        return string;
    };

    TEnvironment.internationalize(Score, true);

    return Score;
});

/*
 * TESTS 
 s = new Score()
 tangara.écrire(s.récupérerScore())
 tangara.écrire(s.récupérerLabel())
 tangara.écrire(s.récupérerNombreScore())
 s.augmenterScore()
 s.augmenterScore()
 tangara.écrire("texte" + s.récupérerScore())
 s.baisserScore()
 tangara.écrire("texte" + s.récupérerScore())
 s._setScoreNumber(52)
 tangara.écrire(s.récupérerScore())
 tangara.écrire(s.récupérerLabel())
 tangara.écrire(s.récupérerNombreScore())
 
 s._setScoreNumber("lkdjml")
 tangara.écrire(s.récupérerScore())
 s._setScoreNumber(52.9)
 s._setScoreNumber(-52.9)
 s._setScoreNumber(-52)
 s._setScoreNumber(00)
 s.cacher()
 
 */