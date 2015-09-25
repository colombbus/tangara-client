require.config({
    "baseUrl": 'js/tangara',
    paths: {
        "jquery": '../libs/jquery-1.11.1/jquery-1.11.1.min',
        "jquery_animate_enhanced": '../libs/jquery.animate-enhanced/jquery.animate-enhanced.min',
        "ace": '../libs/ace-1.1.7',
        "babylon": '../libs/babylonjs/babylon.1.14',
        "babylonjs": '../libs/babylon-editor/babylon-editor',
        "split-pane": '../libs/split-pane/split-pane',
        "quintus": '../libs/quintus-0.2.0/quintus-all.min',
        "acorn": '../libs/acorn/acorn',
        "TObject": 'objects/tobject/TObject',
        "TObject3D": 'objects/tobject3d/TObject3D',
        "TGraphicalObject": 'objects/tgraphicalobject/TGraphicalObject',
        "fileupload": '../libs/jquery-file-upload/jquery.fileupload',
        "iframe-transport": '../libs/jquery-file-upload/jquery.iframe-transport',
        "jquery-ui": '../libs/jquery.ui-1.11.2',
        "wPaint": '../libs/wpaint-2.5.0/wPaint.min',
        "wColorPicker": '../libs/wpaint-2.5.0/wColorPicker.min',
        "wPaint/plugins/file": '../libs/wpaint-2.5.0/plugins/file/wPaint.menu.main.file.min',
        "wPaint/plugins/main": '../libs/wpaint-2.5.0/plugins/main/wPaint.menu.main.min',
        "wPaint/plugins/shapes": '../libs/wpaint-2.5.0/plugins/shapes/wPaint.menu.main.shapes.min',
        "wPaint/plugins/text": '../libs/wpaint-2.5.0/plugins/text/wPaint.menu.text.min',
        "wPaint/plugins/flip": 'plugins/wPaint.menu.main.flip',
        "TProject": "data/TProject",
        "TProgram": "data/TProgram",
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
        "TResource": "data/TResource"
    },
    map: {
        "fileupload": {
            "jquery.ui.widget": 'jquery-ui/widget'
        }
    },
    shim: {
        'wPaint': {
            deps: ['jquery', 'jquery-ui/core', 'jquery-ui/widget', 'jquery-ui/draggable', 'jquery-ui/mouse']
        },
        'wPaint/plugins/main': {
            deps: ['wPaint']
        },
        'wPaint/plugins/file': {
            deps: ['wPaint', 'wPaint/plugins/main']
        },
        'wPaint/plugins/shapes': {
            deps: ['wPaint', 'wPaint/plugins/main']
        },
        'wPaint/plugins/text': {
            deps: ['wPaint', 'wPaint/plugins/main']
        },
        'wPaint/plugins/flip': {
            deps: ['wPaint', 'wPaint/plugins/main']
        },
        'wColorPicker': {
            deps: ['wPaint']
        }
    }
});

//window.location.protocol + "//" + window.location.host+ window.location.pathname.split("/").slice(0, -1).join("/")+"/js/tangara",
//baseUrl: 'js/tangara',
// Start the main app logic.

function load() {
    require(['jquery', 'TEnvironment', 'TRuntime', 'ui/TFrame', 'TProject'], function($, TEnvironment, TRuntime, TFrame, TProject) {
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
                frame = new TFrame(function(component) {
                    $("body").append(component);
                    window.console.log("*******************");
                    window.console.log("* Initiating link *");
                    window.console.log("*******************");
                    var currentProject = new TProject();
                    currentProject.init(function() {
                        TEnvironment.setProject(currentProject);
                        $(document).ready(function() {
                            // postpone execution in case everything is cached
                            setTimeout(function() {
                                frame.displayed();
                            },0);
                        });
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


