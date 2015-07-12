require.config({
    "baseUrl": 'js/tangara',
    paths: {
        "jquery": '../libs/jquery-1.11.1/jquery-1.11.1.min',
        "quintus": '../libs/quintus-0.2.0/quintus-all.min',
        "acorn": '../libs/acorn/acorn',
        "TObject": 'objects/tobject/TObject',
        "TObject3D": 'objects/tobject3d/TObject3D',
        "TGraphicalObject": 'objects/tgraphicalobject/TGraphicalObject',
        "babylon": '../libs/babylonjs/babylon.1.14',
        "TProject": "data/Tproject",
        "TProgram": "data/TProgram",
        "TLearnProject": "data/TLearnProject",
        "TEnvironment": "env/TEnvironment",
        "TLink": "env/TLink",
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
    }
});

function load() {
    require(['jquery', 'TEnvironment', 'TRuntime', 'ui/TCanvas', 'TProject', 'TLink', 'ui/TExecutionLog'], function($, TEnvironment, TRuntime, TCanvas, TProject, TLink, TExecutionLog) {
        window.console.log("*******************");
        window.console.log("* Loading Environment *");
        window.console.log("*******************");
        TEnvironment.load();

        window.console.log("*******************");
        window.console.log("* Loading Runtime *");
        window.console.log("*******************");
        TRuntime.load(TEnvironment.getLanguage(), TEnvironment.getObjectListUrl());

        var canvas = new TCanvas();
        var domCanvas = canvas.getElement();
        $("body").append(domCanvas);
        TRuntime.setCanvas(canvas);
        var log = new TExecutionLog();
        TRuntime.setLog(log);
        $(document).ready(function() {
            canvas.displayed();
            // trigger resize in order for canvas to update its size (and remove the 5px bottom margin)
            $(window).resize();
            canvas.showLoading();
            TEnvironment.frameReady(function() {
                TLink.setProjectId(init_projectId);
                currentProject.init();
                TEnvironment.setProject(currentProject);
                var statements = TLink.getProgramStatements(init_programName);
                TRuntime.setCurrentProgramName(init_programName);

                TRuntime.preloadResources(currentProject, function() {
                    canvas.removeLoading();
                    TRuntime.executeStatements(statements);
                }, {progressCallback: function(count, total) {
                        canvas.setLoadingValue(count, total);
                    }});
            });
        });
        var currentProject = new TProject();
    });
}

// TODO: handle loading
var loading = new Image();
loading.src = "images/loader2.gif";
if (loading.complete) {
    load();
} else {
    loading.onload = load();
}


