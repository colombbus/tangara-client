define(['acorn'], function(acorn) {
    function TParser() {
        var options = {locations:true, forbidReserved:"everywhere"};
        this.parse = function(input) {
            var result = acorn.parse(input, options);
            // return statements
            return result.body;
        };
    }
    
    var parserInstance = new TParser();
    
    return parserInstance;
});


