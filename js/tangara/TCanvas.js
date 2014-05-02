define(['jquery', 'TEnvironment'], function($, TEnvironment) {

    function TCanvas() {
        var domCanvas = document.createElement("canvas");
        domCanvas.id = "tcanvas";
                
        var qStage;

        var graphicalObjects = new Array();

        this.addGraphicalObject = function(object) {
            if (typeof qStage !== 'undefined') {
                qStage.insert(object.getQObject());
                graphicalObjects.push(object);
            }
        };

        this.removeGraphicalObject = function(object) {
            var index = graphicalObjects.indexOf(object);
            if (index > -1) {
                qStage.remove(object.getQObject());
                graphicalObjects.splice(index, 1);
            }
        };
        
        this.getElement = function() {
            return domCanvas;
        };
        
        this.displayed = function() {
            var qInstance = TEnvironment.getQuintusInstance();
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
        
        this.clear = function() {
            while (graphicalObjects.length>0) {
                graphicalObjects[0].deleteObject();
            }
        };
        
        this.show = function() {
            // find the container added by Quintus
            $("#tcanvas_container").show();
        };
        
        this.hide = function() {
            // find the container added by Quintus
            $("#tcanvas_container").hide();
        };

    }

    return TCanvas;
    
});