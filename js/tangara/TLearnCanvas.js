define(['jquery', 'TRuntime'], function ($, TRuntime) {

    function TLearnCanvas() {
        var domCanvasOut = document.createElement("div");
        domCanvasOut.id = "tcanvas-outer";
        var domCanvasDesign = document.createElement("div");
        domCanvasDesign.id = "tcanvas-design";
        var domCanvasDesignMouse = document.createElement("div");
        domCanvasDesignMouse.id = "tcanvas-design-mouse";
        domCanvasDesign.appendChild(domCanvasDesignMouse);
        var $domCanvasDesignMouse = $(domCanvasDesignMouse);
        $domCanvasDesignMouse.addClass("right-design");

        // start with design mode off
        domCanvasDesign.style.display = "none";
        domCanvasOut.appendChild(domCanvasDesign);
        var domCanvas3d = document.createElement("canvas");
        domCanvas3d.id = "tcanvas3d";
        var $domCanvas3d = $(domCanvas3d);
        var domCanvas = document.createElement("canvas");
        domCanvas.id = "tcanvas";
        domCanvasOut.appendChild(domCanvas3d);
        domCanvasOut.appendChild(domCanvas);
        var qStage;
        var designMouseHandler = function (event) {
            var x = event.clientX + domCanvasOut.scrollLeft;
            var y = event.clientY + domCanvasOut.scrollTop;
            $domCanvasDesignMouse.text(x + "," + y);
        };
        
        var domCanvasLoading = document.createElement("div");
        domCanvasLoading.id = "tcanvas-loading";
        var domCanvasLoadingValue = document.createElement("div");
        domCanvasLoadingValue.id = "tcanvas-loading-value";
        domCanvasLoading.appendChild(domCanvasLoadingValue);

        /**
         *
         * @param event
         */
        var designMouseSideHandler = function (event) {
            if ($domCanvasDesignMouse.hasClass("left-design")) {
                $domCanvasDesignMouse.removeClass("left-design");
                $domCanvasDesignMouse.addClass("right-design");
                return;
            }
            else {
                $domCanvasDesignMouse.removeClass("right-design");
                $domCanvasDesignMouse.addClass("left-design");
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
        this.getElement = function () {
            return domCanvasOut;
        };
        this.displayed = function () {
            var qInstance = TRuntime.getQuintusInstance();
            qInstance.setup("tcanvas", {maximize: false}).touch(qInstance.SPRITE_ALL);
            qInstance.stageScene(null);
            qStage = qInstance.stage();
            var outer = $(domCanvasOut);
            // resize canvas and its container when window is resized
            $(window).resize(function (e) {
                var outer = $(domCanvasOut);
                var width = outer.width();
                var height = outer.height();
                $(domCanvas).width(width);
                $(domCanvas).height(height);
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
            $(domCanvasOut).show();
        };
        this.hide = function () {
            $(domCanvasOut).hide();
        };
        this.setDesignMode = function (value) {
            if (value) {
                $(domCanvasDesign).show();
                $(domCanvas).on("mousemove", designMouseHandler);
                $domCanvasDesignMouse.on("mouseover", designMouseSideHandler);

//                $domCanvas3d.on("click", function(e) {
//                    console.log("c3D clicked");
//                    if (e.clientY > $(this).outerHeight() - 14) {
//                        alert('clicked on the bottom border!');
//                    }
//                });
            } else {
                $(domCanvasDesign).hide();
                $domCanvasDesignMouse.text("");
                $(domCanvas).off("mousemove", designMouseHandler);
                $domCanvasDesignMouse.off("mouseover", designMouseSideHandler);
            }
        };
        this.showLoading = function() {
            domCanvasOut.appendChild(domCanvasLoading);
        };
        this.setLoadingValue = function(count, total) {
            var value = Math.round(count*100/total);
            $(domCanvasLoadingValue).text(value+"%");
        };
        this.removeLoading = function() {
            domCanvasOut.removeChild(domCanvasLoading);
        };
        
        
    }

    return TLearnCanvas;
});