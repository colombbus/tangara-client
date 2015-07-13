require.config({
    "baseUrl": 'js/tangara',
    paths: {
        "jquery": '../libs/jquery-1.11.1/jquery-1.11.1.min',
        "jquery_animate_enhanced": '../libs/jquery.animate-enhanced/jquery.animate-enhanced.min',
        "ace": '../libs/ace-1.1.7',
        "babylon": '../libs/babylonjs/babylon.1.14',
        "babylonjs": '../libs/babylon-editor/babylon-editor',
        "quintus": '../libs/quintus-0.2.0/quintus-all.min',
        "acorn": '../libs/acorn/acorn',
        "TObject": 'objects/tobject/TObject',
        "TObject3D": 'objects/tobject3d/TObject3D',
        "TGraphicalObject": 'objects/tgraphicalobject/TGraphicalObject',
        "jquery-ui": '../libs/jquery.ui-1.11.2',
        "TProject": "data/Tproject",
        "TProgram": "data/TProgram",
        "TLearnProject": "data/TLearnProject",
        "TEnvironment": "env/TEnvironment",
        "TLink": "env/TLink",
        "TI18n": "env/TI18n",
        "TInterpreter": "run/TInterpreter",
        "TParser": "run/Tparser",
        "TRuntime": "run/TRuntime",
        "TGraphics": "run/TGraphics",
        "TUI": "ui/TUI",
        "CommandManager": "utils/CommandManager",
        "ResourceManager": "utils/ResourceManager",
        "SynchronousManager": "utils/SynchronousManager",
        "TError": "utils/TError",
        "TUtils": "utils/TUtils"
    },
    map: {
        "fileupload": {
            "jquery.ui.widget": 'jquery-ui/widget'
        }
    }
});

//window.location.protocol + "//" + window.location.host+ window.location.pathname.split("/").slice(0, -1).join("/")+"/js/tangara",
//baseUrl: 'js/tangara',
// Start the main app logic.

function load() {
    require(['jquery', 'TEnvironment', 'TRuntime', 'ui/TLearnFrame', 'TLearnProject'], function($, TEnvironment, TRuntime, TLearnFrame, TProject) {
        window.console.log("*******************");
        window.console.log("* Loading Environment *");
        window.console.log("*******************");
        TEnvironment.load();

        window.console.log("*******************");
        window.console.log("* Loading Runtime *");
        window.console.log("*******************");
        TRuntime.load(TEnvironment.getLanguage(), TEnvironment.getObjectListUrl());

        window.console.log("***************************");
        window.console.log("* Building User Interface *");
        window.console.log("***************************");
        frame = new TLearnFrame(function(component) {
            $("body").append(component);
            window.console.log("*******************");
            window.console.log("* Initiating link *");
            window.console.log("*******************");
            var currentProject = new TProject();
            TEnvironment.setProject(currentProject);
            $(document).ready(function() {
                frame.displayed();
                // trigger resize in order for canvas to update its size (and remove the 5px bottom margin)
                $(window).resize();
                TEnvironment.frameReady(function() {
                    try {
                        frame.init();
                    } catch (e)
                    {
                    }
                    frame.loadStep(1);
                });
            });
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


