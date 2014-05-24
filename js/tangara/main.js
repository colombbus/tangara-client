require.config({
    "baseUrl":'js/tangara',

    paths: {
        "jquery":'../libs/jquery-1.9.0/jquery.min',
        "jquery_animate_enhanced":'../libs/jquery.animate-enhanced/jquery.animate-enhanced.min',
        "ace":'../libs/ace',
        "split-pane":'../libs/split-pane/split-pane',
        "quintus":'../libs/quintus-0.2.0/quintus-all.min',
        "acorn":'../libs/acorn/acorn',
        "TObject":'objects/tobject/TObject',
        "TGraphicalObject":'objects/tgraphicalobject/TGraphicalObject'
    }
});

//window.location.protocol + "//" + window.location.host+ window.location.pathname.split("/").slice(0, -1).join("/")+"/js/tangara",
//baseUrl: 'js/tangara',
// Start the main app logic.
require(['jquery', 'TEnvironment', 'TRuntime', 'TFrame'],function($, TEnvironment, TRuntime, TFrame) {
    TRuntime.load(TEnvironment.getLanguage(), TEnvironment.getObjectListUrl());
    frame = new TFrame();
    domFrame = frame.getElement();
    $("body").append(domFrame);
    $(document).ready( function() {
        frame.displayed();
    });
   
});

