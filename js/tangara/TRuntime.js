define(['jquery'], function($) {
    function TRuntime() {
        var libs = new Array();
        var translatedNames = new Array();
        var runtimeFrame;
        var runtimeCallback;
        
        this.load = function() {
            require(['TEnvironment'], function(TEnvironment) {
                var language = TEnvironment.getLanguage();
                var objectsListUrl = TEnvironment.getObjectsUrl()+"/objects.json";
                
                // create runtime frame
                runtimeFrame = TEnvironment.initRuntimeFrame();
                
                //runtime
                window.console.log("accessing objects list from: "+objectsListUrl);
                $.ajax({
                    dataType: "json",
                    url: objectsListUrl,
                    async: false,
                    success: function(data) {
                        $.each( data, function( key, val ) {
                            var lib = "objects/"+val['path']+"/"+key;
                            if (typeof val['translations'][language] !== 'undefined') {
                                window.console.log("adding "+lib);
                                libs.push(lib);
                                translatedNames.push(val['translations'][language]);
                            }
                        });
                    }
                });
                // declare global variables
                require(libs, function() {
                    for(var i= 0; i < translatedNames.length; i++) {
                        window.console.log("Declaring translated object '"+translatedNames[i]+"'");
                        runtimeFrame[translatedNames[i]] = arguments[i];
                    }
                });
            });
        };
        
        this.execute = function(commands, parameter) {
            var error = false;
            var message;
            try {
                if (typeof (runtimeCallback) === 'undefined') {
                    if (typeof commands === 'string' || commands instanceof String)
                        eval(commands);
                    else if (typeof commands === 'function' || commands instanceof Function)
                        commands(parameter);
                } else {
                    runtimeCallback(commands, parameter);
                }
            } catch (e) {
                error = true;
                message = e.message;
            }
            require(['TEnvironment'], function(TEnvironment) {
                if (error)
                    TEnvironment.addLog(commands, message);
                else
                    TEnvironment.addLog(commands);
            });
        };
        
        this.setCallback = function(callback) {
            runtimeCallback = callback;
        };
    };
    
    var runtimeInstance = new TRuntime();
    
    return runtimeInstance;
});


