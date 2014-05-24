define(['acorn'], function(acorn) {
    function TParser() {
        var options = {locations:true, forbidReserved:"everywhere"};
        this.parse = function(input) {
            return acorn.parse(input, options);
        };
    }
    
    var parserInstance = new TParser();
    
    return parserInstance;
});


