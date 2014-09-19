require.config({
    "baseUrl":'js/tangara',

    paths: {
        "jquery":'../libs/jquery-1.11.1/jquery-1.11.1.min',
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
require(['jquery', 'TEnvironment', 'TRuntime', 'TFrame', 'TProject'],function($, TEnvironment, TRuntime, TFrame, TProject) {
    window.console.log("*******************");
    window.console.log("* Loading Runtime *");
    window.console.log("*******************");
    TRuntime.load(TEnvironment.getLanguage(), TEnvironment.getObjectListUrl());
    
    window.console.log("***************************");
    window.console.log("* Building User Interface *");
    window.console.log("***************************");
    frame = new TFrame();
    domFrame = frame.getElement();
    $("body").append(domFrame);

    window.console.log("*******************");
    window.console.log("* Initiating link *");
    window.console.log("*******************");
    var currentProject = new TProject();
    currentProject.update();
    TEnvironment.setProject(currentProject);
    
    $(document).ready( function() {
        frame.displayed();
    });
   
});

