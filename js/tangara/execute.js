require.config({
    "baseUrl":'js/tangara',

    paths: {
        "jquery":'../libs/jquery-1.11.1/jquery-1.11.1.min',
        "quintus":'../libs/quintus-0.2.0/quintus-all.min',
        "acorn":'../libs/acorn/acorn',
        "TObject":'objects/tobject/TObject',
        "TGraphicalObject":'objects/tgraphicalobject/TGraphicalObject'
    }
});

function load() {
    require(['jquery', 'TEnvironment', 'TRuntime', 'TCanvas', 'TProject', 'TLink'],function($, TEnvironment, TRuntime, TCanvas, TProject, TLink) {
        window.console.log("*******************");
        window.console.log("* Loading Runtime *");
        window.console.log("*******************");
        TRuntime.load(TEnvironment.getLanguage(), TEnvironment.getObjectListUrl());

        canvas = new TCanvas();
        domCanvas = canvas.getElement();
        $("body").append(domCanvas);
        TRuntime.setCanvas(canvas);
        $(document).ready( function() {
            canvas.displayed();
            // trigger resize in order for canvas to update its size (and remove the 5px bottom margin)
            $(window).resize();
            TEnvironment.frameReady(function() {
                TLink.setProjectId(init_projectId);
                currentProject.update();
                TEnvironment.setProject(currentProject);            
                var statements = TLink.getProgramStatements(init_programName);
                TRuntime.setCurrentProgramName(init_programName);
                TRuntime.executeStatements(statements);
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


