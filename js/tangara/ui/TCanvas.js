define(['jquery', 'TRuntime', 'ui/TComponent'], function ($, TRuntime, TComponent) {

    function TCanvas(callback) {
	    var $main, $canvas, $canvasDesign, $canvasDesignMouse, $canvasLoading, $canvasLoadingValue;
	    
        TComponent.call(this, "TCanvas.html", function(component) {
	        $main = component;
	        $canvas = component.find("#tcanvas");
	        $canvasDesign = component.find("#tcanvas-design");
	        $canvasDesignMouse = component.find("#tcanvas-design-mouse");
			$canvasLoading =component.find("#tcanvas-loading");
			$canvasLoadingValue =component.find("#tcanvas-loading-value");

	        $canvasDesign.hide();
			$canvasLoading.hide();
			
	        if (typeof callback !== 'undefined') {
		        callback.call(this, component);
	        }
        });
        
        var qStage;
        var designMouseHandler = function (event) {
            var x = event.clientX + $main.scrollLeft();
            var y = event.clientY + $main.scrollTop();
            $canvasDesignMouse.text(x + "," + y);
        };
        
        /**
         *
         * @param event
         */
        var designMouseSideHandler = function (event) {
            if ($canvasDesignMouse.hasClass("left-design")) {
                $canvasDesignMouse.removeClass("left-design");
                $canvasDesignMouse.addClass("right-design");
                return;
            }
            else {
                $canvasDesignMouse.removeClass("right-design");
                $canvasDesignMouse.addClass("left-design");
            }
        };

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
	        qInstance.setup("tcanvas", {maximize: true}).touch(qInstance.SPRITE_ALL);
	        qInstance.stageScene(null);
	        qStage = qInstance.stage();
	        // resize canvas and its container when window is resized
	        $(window).resize(function (e) {
	            var width = $main.width();
	            var height = $main.height();
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
	
	    this.setDesignMode = function (value) {
	        if (value) {
	            $canvasDesign.show();
	            $canvas.on("mousemove", designMouseHandler);
	            $canvasDesignMouse.on("mouseover", designMouseSideHandler);
	
	//                $domCanvas3d.on("click", function(e) {
	//                    console.log("c3D clicked");
	//                    if (e.clientY > $(this).outerHeight() - 14) {
	//                        alert('clicked on the bottom border!');
	//                    }
	//                });
	        } else {
	            $canvasDesign.hide();
	            $canvasDesignMouse.empty();
	            $canvas.off("mousemove", designMouseHandler);
	            $canvasDesignMouse.off("mouseover", designMouseSideHandler);
	        }
	    };
	
	    this.showLoading = function() {
		    $canvasLoading.show();
	    };
	
	    this.setLoadingValue = function(count, total) {
	        var value = Math.round(count*100/total);
	        $canvasLoadingValue.text(value+"%");
	    };
	
	    this.removeLoading = function() {
		    $canvasLoading.hide();
	    };
    };
    
    TCanvas.prototype = Object.create(TComponent.prototype);
    TCanvas.prototype.constructor = TCanvas;

    return TCanvas;
});