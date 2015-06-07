define(['jquery','TLearnCanvas', 'TLearnEditor', 'TRuntime', 'TEnvironment'], function($, TCanvas, TEditor, TRuntime, TEnvironment) {
    function TLearnFrame() {
        var initialized = false;
        var domFrame = document.createElement("div");
        domFrame.id = "tlearnframe";
        var leftDiv = document.createElement("div");
        leftDiv.id = "tlearnframe-left";
        var stepsDiv = document.createElement("div");
        stepsDiv.id = "tlearnframe-steps";
        leftDiv.appendChild(stepsDiv);
        var lessonDiv = document.createElement("div");
        lessonDiv.id = "tlearnframe-lesson";
        
        var lessonH1 = document.createElement("h2");
        var lessonTitle = "Instructions";
        lessonH1.appendChild(document.createTextNode(lessonTitle));
        lessonDiv.appendChild(lessonH1);
        var lessonP = document.createElement("p");
        var lessonText = "Tu peux faire bouger le robot avec les instructions :";
        lessonP.appendChild(document.createTextNode(lessonText));
        lessonDiv.appendChild(lessonP);
        var lessonPA = document.createElement("p");
        lessonPA.className = "code";
        var lessonPAText = "bob.avancer()";
        lessonPA.appendChild(document.createTextNode(lessonPAText));
        lessonDiv.appendChild(lessonPA);
        var lessonPR = document.createElement("p");
        lessonPR.className = "code";
        var lessonPRText = "bob.avancer()";
        lessonPR.appendChild(document.createTextNode(lessonPRText));
        lessonDiv.appendChild(lessonPR);
        var lessonPM = document.createElement("p");
        lessonPM.className = "code";
        var lessonPMText = "bob.monter()";
        lessonPM.appendChild(document.createTextNode(lessonPMText));
        lessonDiv.appendChild(lessonPM);
        var lessonPD = document.createElement("p");
        lessonPD.className = "code";
        var lessonPDText = "bob.descendre()";
        lessonPD.appendChild(document.createTextNode(lessonPDText));
        lessonDiv.appendChild(lessonPD);
        var lessonP2 = document.createElement("p");
        var lessonText2 = "Essaye !";
        lessonP2.appendChild(document.createTextNode(lessonText2));
        lessonDiv.appendChild(lessonP2);

        
        
        leftDiv.appendChild(lessonDiv);
        
        var rightDiv = document.createElement("div");
        rightDiv.id = "tlearnframe-right";
        
        // Add Canvas
        var canvasDiv = document.createElement("div");
        canvasDiv.id = "tlearnframe-canvas";
        var canvas = new TCanvas();
        canvasDiv.appendChild(canvas.getElement());
        rightDiv.appendChild(canvasDiv);
        // Add Editor
        var editor = new TEditor();
        rightDiv.appendChild(editor.getElement());
        var bottomDiv = document.createElement("div");
        bottomDiv.id = "tlearnframe-bottom";
        
        var buttonExecute = document.createElement("button");
        buttonExecute.className = "ttoolbar-button ttoolbar-button-execute";
        var imageExecute = document.createElement("img");
        imageExecute.src = TEnvironment.getBaseUrl() + "/images/play.png";
        imageExecute.className = "ttoolbar-button-image";
        buttonExecute.appendChild(imageExecute);
        buttonExecute.appendChild(document.createTextNode(TEnvironment.getMessage('button-execute')));
        bottomDiv.appendChild(buttonExecute);

        var buttonClear = document.createElement("button");
        buttonClear.className = "ttoolbar-button ttoolbar-button-clear";
        var imageClear = document.createElement("img");
        imageClear.src = TEnvironment.getBaseUrl() + "/images/clear.png";
        imageClear.className = "ttoolbar-button-image";
        buttonClear.appendChild(imageClear);
        buttonClear.appendChild(document.createTextNode("Réinitialiser"));
        bottomDiv.appendChild(buttonClear);
        
        rightDiv.appendChild(bottomDiv);
        
        domFrame.appendChild(leftDiv);
        domFrame.appendChild(rightDiv);

        var loadingDiv = document.createElement("div");
        loadingDiv.id = "tlearnframe-loading";
        var loadingImg = document.createElement("img");
        loadingImg.src = TEnvironment.getBaseUrl() + "/images/loader2.gif";
        loadingDiv.appendChild(loadingImg);
        domFrame.appendChild(loadingDiv);


        var startStatements = [{end: 1, expression:{end:15, left:{end:1, loc:{}, name:"bob", raw:"bob", start:0, type:"Identifier"}, loc:{}, operator:"=", raw:"bob = new Robot()", right:{arguments:[], callee:{end:13, loc:{}, name:"Robot", raw:"Robot", start:8, type:"Identifier"}, end:15, loc:{}, raw:"new Robot()", start:4, type:"NewExpression"}, start:0, type:"AssignmentExpression"}, loc:{}, raw:"bob = new Robot()", start:1, type:"ExpressionStatement"}];
            
        // Plug Runtime with Canvas and Log
        TRuntime.setCanvas(canvas);
//        TRuntime.setLog(log);
        
        this.getElement = function() {
            return domFrame;
        };
        
        this.displayed = function() {
            canvas.displayed();
            editor.displayed();
            initialized = true;
            this.ready();
            var frame = this;
            buttonExecute.onclick = function() { frame.execute(); };
            buttonClear.onclick = function() { frame.clear(); };
        };
        
        this.ready = function() {
            TEnvironment.frameReady(function() {
                $(loadingDiv).fadeOut(1000, function() {$(this).remove();});
            });
        };
        
        this.init = function() {
            TRuntime.executeStatements(startStatements);
        };
        
        this.execute = function() {
            console.debug(editor.getStatements());
            TRuntime.executeStatements(editor.getStatements());
        };
        
        this.clear = function() {
            TRuntime.clear();
            this.init();
        };


    }
    
    return TLearnFrame;
});
