define(['jquery', 'TRuntime'], function ($, TRuntime) {

    function TLearnCanvas(callback) {
	    var $main, $canvas, $canvasLoading, $canvasLoadingValue;
	    
        TComponent.call(this, "TLearnCanvas.html", function(component) {
	        $main = component;
	        $canvas = component.find("#tcanvas");
	        $canvasLoading = component.find("#tcanvas-loading");
	        $canvasLoadingValue = component.find("#tcanvas-loading-value");
	        
	        if (typeof callback !== 'undefined') {
		        callback.call(this, component);
	        }
        });
	    
        var qStage;
        var loading = true;
        
        this.addGraphicalObject = function (object) {
            if (typeof qStage !== 'undefined') {
                qStage.insert(object.getQObject());
            }
        };

        this.removeGraphicalObject = function (object) {
            qStage.remove(object.getQObject());
        };

        this.displayed = function () {
            var qInstance = TRuntime.getQuintusInstance();
            qInstance.setup("tcanvas", {maximize: false}).touch(qInstance.SPRITE_ALL);
            qInstance.stageScene(null);
            qStage = qInstance.stage();
            // resize canvas and its container when window is resized
            $(window).resize(function (e) {
                var width = $main.width();
                var height = $main.height();
                $canvas.width(width);
                $canvas.height(height);
                var Q = TRuntime.getQuintusInstance();
                Q.el.style.height = height + "px";
                Q.el.style.width = width + "px";
                Q.el.width = width;
                Q.el.height = height;
                Q.wrapper.style.width = width + "px";
                Q.wrapper.style.height = height + "px";
                Q.width = width;
                Q.height = height;
                Q.cssWidth = width;
                Q.cssHeight = height;
                qStage.defaults['w'] = width;
                qStage.defaults['h'] = height;
            });
        };
        
        this.show = function () {
            $main.show();
        };
        
        this.hide = function () {
            $main.hide();
        };
        this.showLoading = function() {
	        if (!loading) {
	            $main.appendChild($canvasLoading);
	            loading = true;
            }
        };
        this.setLoadingValue = function(count, total) {
            var value = Math.round(count*100/total);
            $canvasLoadingValue.text(value+"%");
        };
        this.removeLoading = function() {
	        if (loading) {
		        $canvas.remove($canvasLoading);
		        loading = false;
	        }
        };
       
    }

    TLearnCanvas.prototype = Object.create(TComponent.prototype);
    TLearnCanvas.prototype.constructor = TLearnCanvas;

    return TLearnCanvas;
});