define(['jquery', 'TRuntime'], function($, TRuntime) {

    function TCanvas() {
        var domCanvasOut = document.createElement("div");
        domCanvasOut.id = "tcanvas-outer";
        
        var domCanvasDesign = document.createElement("div");
        domCanvasDesign.id = "tcanvas-design";
        // start with design mode off
        domCanvasDesign.style.display="none";

        domCanvasOut.appendChild(domCanvasDesign);

        
        var domCanvas = document.createElement("canvas");
        domCanvas.id = "tcanvas";
        
        domCanvasOut.appendChild(domCanvas);
        
        var qStage;


        this.addGraphicalObject = function(object) {
            if (typeof qStage !== 'undefined') {
                qStage.insert(object.getQObject());
            }
        };

        this.removeGraphicalObject = function(object) {
            qStage.remove(object.getQObject());
        };
        
        this.getElement = function() {
            return domCanvasOut;
        };
        
        this.displayed = function() {
            var qInstance = TRuntime.getQuintusInstance();
            //QInstance.setup("tcanvas",{ height:domCanvas.style.height, width:domCanvas.style.width});
            qInstance.setup("tcanvas", {maximize: true }).touch(qInstance.SPRITE_ALL);
            qInstance.stageScene(null);
            qStage = qInstance.stage();
            // remove fixed width and height set up by quintus
            var canvas = document.getElementById("tcanvas");
            /*canvas.removeAttribute("style");
            canvas.removeAttribute("width");
            canvas.removeAttribute("height");
            var container = document.getElementById("tcanvas_container");
            container.removeAttribute("style");*/
        };
        
        this.show = function() {
            $(domCanvasOut).show();
        };
        
        this.hide = function() {
            $(domCanvasOut).hide();
        };

        this.setDesignMode = function(value) {
            if (value) {
                $(domCanvasDesign).show();
            } else {
                $(domCanvasDesign).hide();
            }
        };
        
    }

    return TCanvas;
    
});