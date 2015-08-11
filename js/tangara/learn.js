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
        "TProject": "data/TProject",
        "TProgram": "data/TProgram",
        "TLearnProject": "data/TLearnProject",
        "TEnvironment": "env/TEnvironment",
        "TLink": "env/TLink",
        "TI18n": "env/TI18n",
        "TInterpreter": "run/TInterpreter",
        "TParser": "run/TParser",
        "TRuntime": "run/TRuntime",
        "TGraphics": "run/TGraphics",
        "TUI": "ui/TUI",
        "CommandManager": "utils/CommandManager",
        "ResourceManager": "utils/ResourceManager",
        "SynchronousManager": "utils/SynchronousManager",
        "TError": "utils/TError",
        "TUtils": "utils/TUtils",
        "platform-pr": "../libs/pem-task/platform-pr",
        "miniPlatform": "../libs/pem-task/miniPlatform",
        "json": "../libs/pem-task/json2.min",
        "Task": "env/Task",
        "Grader": "env/Grader",
        "TExercise": "data/TExercise"
    },
    map: {
        "fileupload": {
            "jquery.ui.widget": 'jquery-ui/widget'
        }
    },
    shim: {
        'platform-pr': {
            deps: ['jquery'],
            exports: '$'
        },
        
        'miniPlatform': {
            deps: ['jquery', 'platform-pr'],
            exports: '$'
        }
    }    
});

//window.location.protocol + "//" + window.location.host+ window.location.pathname.split("/").slice(0, -1).join("/")+"/js/tangara",
//baseUrl: 'js/tangara',
// Start the main app logic.

function load() {
    require(['jquery', 'TEnvironment', 'TRuntime', 'ui/TLearnFrame', 'TLearnProject', 'Task', 'Grader'], function($, TEnvironment, TRuntime, TLearnFrame, TProject, Task, Grader) {
        window.console.log("*******************");
        window.console.log("* Loading Environment *");
        window.console.log("*******************");
        TEnvironment.load(function() {
            window.console.log("*******************");
            window.console.log("* Loading Runtime *");
            window.console.log("*******************");
            TRuntime.load(function() {
                window.console.log("***************************");
                window.console.log("* Building User Interface *");
                window.console.log("***************************");
                frame = new TLearnFrame(function(component) {
                    $("body").append(component);
                    window.console.log("*******************");
                    window.console.log("* Initiating link *");
                    window.console.log("*******************");
                    // Create task and grader
                    window.task = new Task(frame);
                    window.grader = new Grader();
                    // get exercise id
                    var exerciseId;
                    if (typeof init_exerciseId !== 'undefined') {
                        // get id from server
                        exerciseId = init_exerciseId;
                    } else {
                        // get id from hash
                        var hash = document.location.hash;
                        exerciseId = parseInt(hash.substring(1));
                    }
                    window.console.log("********************");
                    window.console.log("* Loading exercise *");
                    window.console.log("********************");
                    
                    $(document).ready(function() {
                        frame.displayed();
                        // trigger resize in order for canvas to update its size (and remove the 5px bottom margin)
                        $(window).resize();
                        frame.init();
                        if (isNaN(exerciseId)) {
                            window.console.error("Could not find exercise id");
                        } else {
                            frame.loadExercise(exerciseId);
                        }
                    });
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


