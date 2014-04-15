require.config({
    "baseUrl":'js/tangara',

    paths: {
        "jquery":'../libs/jquery-1.9.0/jquery.min',
        "jquery_animate_enhanced":'../libs/jquery.animate-enhanced/jquery.animate-enhanced.min'
    }
});

require(['jquery'],function($) {
    $(document).ready( function() {
        window.thatObject = Object.create(null);
        window.execute = function(commands, parameter) {
            // sandbox : prevent window and document objects from direct access 
            // and remove reference to 'this'
            // not secure though : these objects can still be accessed using functions
            // e.g. (function(){this.window.alert("hello");})()
            var objectsSandbox, thisSandbox;
            if (typeof commands === 'string' || commands instanceof String) {
                // commands are string: we wrap them in a function
                objectsSandbox = new Function('window', 'document', commands);
                var thisSandbox  = objectsSandbox.bind(window.thatObject);
                thisSandbox({}, {});
            } else if (typeof commands === 'function'  || commands instanceof Function) {
                // commands are function: we cannot neutralize window and document objects
                thisSandbox  = commands.bind(window.thatObject);
                thisSandbox(parameter);
            }
        };
        parent.bindSandbox(window.execute);
    });
   
});


