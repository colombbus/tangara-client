define(['TUI', 'TEnvironment', 'TProgram', 'jquery', 'jquery.ui.widget', 'iframe-transport', 'fileupload', 'fancybox'], function(TUI, TEnvironment, TProgram, $) {

    function TSidebar() {
        var domSidebar = document.createElement("div");
        domSidebar.id = "tsidebar";
        
        var domSwitch = document.createElement("div");
        domSwitch.id = "tsidebar-switch";
        var switchPrograms = document.createElement("div");
        switchPrograms.id = "tsidebar-switch-programs";
        switchPrograms.title = TEnvironment.getMessage("switch-programs");
        var switchResources = document.createElement("div");
        switchResources.id = "tsidebar-switch-resources";
        switchResources.title = TEnvironment.getMessage("switch-resources");
        domSwitch.appendChild(switchPrograms);
        domSwitch.appendChild(switchResources);
        domSidebar.appendChild(domSwitch);
        switchPrograms.onclick = function(e) { TUI.displayPrograms();};
        switchResources.onclick = function(e) { TUI.displayResources();};

        var domSidebarPrograms = document.createElement("div");
        domSidebarPrograms.id = "tsidebar-programs";
        domSidebar.appendChild(domSidebarPrograms);

        var domSidebarResources = document.createElement("div");
        domSidebarResources.id = "tsidebar-resources";
        var domSidebarUpload = document.createElement("form");
        domSidebarUpload.id = "tsidebar-upload";
        domSidebarUpload.setAttribute("method", "post");
        //domSidebarUpload.setAttribute("name", "files[]");
        domSidebarUpload.setAttribute("action", "TO_BE_DEFINED");
        domSidebarUpload.setAttribute("enctype", "multipart/form-data");
        var domSidebarFiles = document.createElement("div");
        domSidebarFiles.id = "tsidebar-files";
        domSidebarUpload.appendChild(domSidebarFiles);
        domSidebarResources.appendChild(domSidebarUpload);
        var domEmptyMedia = document.createElement("div");
        domEmptyMedia.id="tsidebar-resources-empty";
        var domEmptyMediaP = document.createElement("p");
        domEmptyMediaP.appendChild(document.createTextNode(TEnvironment.getMessage("empty-media-library")));
        domEmptyMedia.appendChild(domEmptyMediaP);
        domSidebarResources.appendChild(domEmptyMedia);
        
        domSidebar.appendChild(domSidebarResources);
    
        var programsVisible = false;
        var empty = true;    
    
        this.getElement = function() {
            return domSidebar;
        };
        
        this.displayed = function() {
            this.displayPrograms();
            this.update();
            // Set up blueimp fileupload plugin
            $(domSidebarUpload).fileupload({
                dataType: 'json',
                add: function (e, data) {
                    var newDivs=[];
                    var newNames=[];
                    try {
                        // Insert div corresponding to loading files
                        var files = data.files;
                        var project = TEnvironment.getProject();
                        var div;
                        var $domSidebarFiles = $(domSidebarFiles);
                        for (var i=0; i<files.length; i++) {
                            var file = files[i];
                            div = getResourceDiv(file.name, 'uploading', false);
                            // add progress bar
                            var domProgress = document.createElement("div");
                            domProgress.className = "progress-bar-wrapper";
                            var domBar = document.createElement("div");
                            domBar.className = "progress-bar";
                            domProgress.appendChild(domBar);
                            div.appendChild(domProgress);
                            var index = project.uploadingResource(file.name);
                            var where = $domSidebarFiles.find('.tsidebar-file:eq('+index+')');
                            if (where.length > 0)
                                where.before(div);
                            else 
                                $domSidebarFiles.append(div);
                            newDivs.push(div);
                            
                        }
                        if (empty) {
                            domSidebarResources.removeChild(domEmptyMedia);
                            empty = false;
                        }
                        var $domSidebarResources = $(domSidebarResources);
                        $domSidebarResources.animate({scrollTop: $domSidebarResources.scrollTop()+$(div).position().top}, 1000);
                        data.submit();
                    } catch (error) {
                        // error
                        // 1st remove loading resources
                        for (var i=0; i<newNames.length;i++) {
                            project.removeUploadingResource(newNames[i]);
                        }
                        // 2nd remove loading resources div
                        for (var i=0; i<newDivs.length;i++) {
                            domSidebarFiles.removeChild(newDivs[i]);
                        }
                        // 3rd check if there is some file left, otherwise add "empty" message
                        if (!domSidebarFiles.hasChildNodes() && !empty) {
                            domSidebarResources.appendChild(domEmptyMedia);
                            empty = true;
                        }
                        
                        // 4th display error
                        TUI.addLogError(error);
                    }
                },
                done: function (e, data) {
                    data.context.text('Upload finished.');
                    /*$.each(data.result.files, function (index, file) {
                        $('<p/>').text(file.name).appendTo(document.body);
                    });*/
                },
                progress: function (e, data) {
                    // TODO : update given progress bar 
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $('#progress .bar').css('width',progress + '%');
                }
            });
        };
        
        this.update = function() {
            this.updatePrograms();
            this.updateResources();
        };
        
        this.updatePrograms = function() {
            var project = TEnvironment.getProject();
            var programList = project.getProgramsNames();
            var editedPrograms = project.getEditedPrograms();
            var currentProgram = TUI.getCurrentProgram();
            var editedNames = [];
            
            domSidebarPrograms.innerHTML = "";

            function addElement(name, id, displayedName, edited, current) {
                var element = document.createElement("div");
                element.className = "tsidebar-program";
                if (edited) {
                    element.className += " tsidebar-edited";
                }
                if (typeof current !== 'undefined' && current) {
                    element.className += " tsidebar-current";
                }
                $(element).click(function(e){
                    if ($(this).hasClass('tsidebar-renaming'))
                        return false;
                    if (current) {
                        // rename program
                        $(this).addClass('tsidebar-renaming');
                        var renameElement = document.createElement("input");
                        renameElement.type="text";
                        renameElement.class="tsidebar-rename";
                        renameElement.value = name;
                        $(renameElement).keydown(function (e) {
                            if (e.which === 13) {
                                // Enter was pressed
                                TUI.renameProgram(name, renameElement.value);
                            }
                            if (e.which === 27) {
                                // Escape was pressed
                                $(this).parent().removeClass('tsidebar-renaming');
                                $(renameElement).remove();
                            }
                        });
                        renameElement.onblur = function() {TUI.renameProgram(name, renameElement.value);};
                        $(this).append(renameElement);
                        renameElement.focus();
                    } else {
                        // edit program
                        TUI.editProgram(name);e.stopPropagation();
                    }
                });
                var nameElement = document.createElement("div");
                nameElement.id = "tsidebar-program-"+id;
                nameElement.appendChild(document.createTextNode(displayedName));
                element.appendChild(nameElement);
                if (edited) {
                    var closeElement = document.createElement("div");
                    closeElement.className = "tsidebar-close";
                    closeElement.onclick = function(e) { TUI.closeProgram(name);e.stopPropagation();};
                    element.appendChild(closeElement);
                }
                domSidebarPrograms.appendChild(element);
            }

            var currentName = "";
            
            if (typeof currentProgram !== 'undefined') {
                currentName = currentProgram.getName();
            }

            for (var i=0; i<editedPrograms.length;i++) {
                var program = editedPrograms[i];
                var programName = program.getName();
                editedNames.push(programName);
                addElement(programName, program.getId(), program.getDisplayedName(), true, programName === currentName);
            }
            
            for (var i=0; i<programList.length;i++) {
                var name = programList[i];
                if (editedNames.indexOf(name) === -1) {
                    addElement(name, TProgram.findId(name), name, false);
                }
            }
        };
        
        
        function getResourceDiv(name, type, loading) {
            var resourceDiv = document.createElement("div");
            resourceDiv.className = "tsidebar-file tsidebar-type-"+type;
            resourceDiv.innerHTML = name;
            resourceDiv.onclick = function(e) {
                if ($(this).hasClass('current')) {
                    // already selected: open using fancybox
                    $.fancybox(TEnvironment.getUserResource(name));
                } else {
                    // set as current
                    $('.tsidebar-file').removeClass('current');
                    $(this).addClass('current');
                }
                //window.alert("Resource : "+name);
            };
            resourceDiv.setAttribute("draggable", "true");
            resourceDiv.ondragstart = function(e) {
                e.dataTransfer.setData("text/plain", "\""+e.target.innerHTML+"\"");
            };
            return resourceDiv;
        }
        
        this.updateResources = function() {
            var project = TEnvironment.getProject();
            var resourcesNames = project.getResourcesNames();
            var resources = project.getResources();
            
            function addElement(name, type) {
                var div = getResourceDiv(name, type, false);
                domSidebarFiles.appendChild(div);
            }
            
            domSidebarFiles.innerHTML = "";
            if (resourcesNames.length === 0) {
                // no media: add message
                if (!empty) {
                    domSidebarResources.appendChild(domEmptyMedia);
                    empty = true;
                }
            } else {
                if (empty) {
                    domSidebarResources.removeChild(domEmptyMedia);
                    empty = false;
                }
                for (var i=0; i<resourcesNames.length; i++) {
                    var name = resourcesNames[i];
                    addElement(name, resources[name].type);
                }
                empty = false;
            }
        };
        
        this.updateProgramInfo = function(program) {
            var id = "#tsidebar-program-"+program.getId();
            $(id).text(program.getDisplayedName());
        };
        
        this.showLoading = function(name) {
            var id = "#tsidebar-program-"+TProgram.findId(name);
            var loadElement = document.createElement("div");
            loadElement.className = "tsidebar-loading";
            $(id).append(loadElement);
        };

        this.showRenaming = function(name) {
            var id = "#tsidebar-program-"+TProgram.findId(name);
            var loadElement = document.createElement("div");
            loadElement.className = "tsidebar-loading";
            $(id).parent().append(loadElement);
        };

        
        this.show = function() {
            $(domSidebar).show();
        };
        
        this.hide = function() {
            $(domSidebar).hide();
        };
        
        this.displayPrograms = function() {
            if (!programsVisible) {
                $(domSidebarPrograms).show();
                $(switchPrograms).addClass("active");
                $(domSidebarResources).hide();
                $(switchResources).removeClass("active");
                $(domSidebar).animate({width:"250px"}, 500);
                programsVisible = true;
            }
        };
        
        this.displayResources = function() {
            if (programsVisible) {
                $(domSidebarPrograms).hide();
                $(switchPrograms).removeClass("active");
                $(domSidebarResources).show();
                $(switchResources).addClass("active");
                $(domSidebar).animate({width:"440px"}, 500);
                programsVisible = false;
            }
        };
    }
    
    return TSidebar;
});
