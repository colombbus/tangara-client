define(['TEnvironment', 'TObject', 'utils/TUtils', 'TRuntime'], function(TEnvironment, TObject, TUtils) {
    var Random = function() {
        TObject.call(this);
    };
    
    Random.prototype = Object.create(TObject.prototype);
    Random.prototype.constructor = Random;
    Random.prototype.className = "Random";
    
    Random.prototype._throwDice = function(max) {
        return Math.floor((Math.random() * max) + 1); 
    };

    TEnvironment.internationalize(Random, true);
    
    return Random;
});