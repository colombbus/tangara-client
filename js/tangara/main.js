require.config({
    "baseUrl":'js/tangara',

    paths: {
        "jquery":'../libs/jquery-1.11.1/jquery-1.11.1.min',
        "jquery_animate_enhanced":'../libs/jquery.animate-enhanced/jquery.animate-enhanced.min',
        "ace":'../libs/ace-1.1.7',
        "split-pane":'../libs/split-pane/split-pane',
        "quintus":'../libs/quintus-0.2.0/quintus-all.min',
        "acorn":'../libs/acorn/acorn',
        "TObject":'objects/tobject/TObject',
        "TGraphicalObject":'objects/tgraphicalobject/TGraphicalObject',
        "fileupload":'../libs/jquery-file-upload/jquery.fileupload',
        "iframe-transport":'../libs/jquery-file-upload/jquery.iframe-transport',
        "jquery.ui.widget":'../libs/jquery-file-upload/vendor/jquery.ui.widget',
        "fancybox":'../libs/fancybox-2.1.5/jquery.fancybox.pack'
    }
});

//window.location.protocol + "//" + window.location.host+ window.location.pathname.split("/").slice(0, -1).join("/")+"/js/tangara",
//baseUrl: 'js/tangara',
// Start the main app logic.

function load() {
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
            window.unsavedFiles = false;
            if (!TEnvironment.debug) {
                window.onbeforeunload = function(e) {
                    if (window.unsavedFiles) {
                        var message = TEnvironment.getMessage("confirm-leaving");
                        var e = e || window.event;
                        if (e) {
                            e.returnValue = message;
                        }
                        return message;
                    }
                };
            }
        });
    });
}

var loading = new Image();
loading.src = "images/loader2.gif";
if (loading.complete) {
    load();
} else {
    loading.onload = load();
}


