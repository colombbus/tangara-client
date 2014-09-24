define(['TUI', 'TEnvironment', 'TProgram', 'jquery', 'jquery.ui.widget', 'iframe-transport', 'fileupload'], function(TUI, TEnvironment, TProgram, $) {

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
        var domSidebarFiles = document.createElement("input");
        domSidebarFiles.id = "tsidebar-upload";
        domSidebarFiles.setAttribute("type", "file");
        domSidebarFiles.setAttribute("name", "files[]");
        domSidebarFiles.setAttribute("data-url", "TO_BE_DEFINED");
        domSidebarFiles.setAttribute("multiple", "multiple");
        domSidebarResources.appendChild(domSidebarFiles);
        var domProgress = document.createElement("div");
        domProgress.id = "progress";
        var domBar = document.createElement("div");
        domBar.className = "bar";
        domProgress.appendChild(domBar);
        domSidebarResources.appendChild(domProgress);
        
        domSidebar.appendChild(domSidebarResources);
    
        var programsVisible = false;
    
        this.getElement = function() {
            return domSidebar;
        };
        
        this.displayed = function() {
            this.displayPrograms();
            this.update();
            // Set up blueimp fileupload plugin
            $(domSidebarResources).fileupload({
                dataType: 'json',
                add: function (e, data) {
                    data.context = $('<p/>').text('Uploading...').appendTo(domSidebarFiles);
                    data.submit();
                },
                done: function (e, data) {
                    data.context.text('Upload finished.');
                    /*$.each(data.result.files, function (index, file) {
                        $('<p/>').text(file.name).appendTo(document.body);
                    });*/
                },
                progressall: function (e, data) {
                    
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
        
        this.updateResources = function() {
        
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
                $(domSidebar).animate({width:"400px"}, 500);
                programsVisible = false;
            }
        };
    }
    
    return TSidebar;
});
