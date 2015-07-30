define(['TEnvironment', 'TRuntime', 'TProject', 'TError', 'objects/teacher/Teacher'], function(TEnvironment, TRuntime, TProject, TError, Teacher) {
    function TExercise() {
        // associated project
        var project = new TProject();
        TEnvironment.setProject(project);
        var checkStatements = false;
        var startStatements = false;
        var solutionCode = false;
        var instructions = false;
        var hints = false;

        this.setId = function(value) {
            project.setId(value);
        };
        
        this.setFrame = function(value) {
            Teacher.setFrame(value);
        };
        
        this.getId = function() {
            return project.getId();
        };
        
        this.hasInstructions = function() {
            return (instructions !== false);
        };
        
        this.hasSolution = function() {
            return (solutionCode !== false);
        };

        this.hasHints = function() {
            return (hints !== false);
        };

        this.hasStart = function() {
            return (startStatements !== false);
        };

        this.hasCheck = function() {
            return (checkStatements !== false);
        };
        
        this.getInstructions = function(callback) {
            if (instructions !== false) {
                project.getResourceContent("instructions.html", callback);
            }
        };
        
        this.getSolution = function() {
            if (solutionCode !== false) {
                return solutionCode;
            }
        };
        
        this.getHints = function(callback) {
            if (hints !== false) {
                project.getResourceContent("hints.html", callback);
            }
        };        
        
        this.init = function() {
            if (startStatements !== false) {
                TRuntime.executeStatements(startStatements);
            }
        };
        
        this.check = function(statements) {
            Teacher.setStatements(statements);
            if (checkStatements !== false) {
                TRuntime.executeStatements(checkStatements);
            }
        };
        
        var loadStart = function(callback) {
            project.getProgramStatements("start.tgr", function(result) {
                if (!(result instanceof TError)) {
                    startStatements = result;
                }
                callback.call(this);
            });
        };
        
        var loadCheck = function(callback) {
            project.getProgramStatements("check.tgr", function(result) {
                if (!(result instanceof TError)) {
                    checkStatements = result;
                }
                callback.call(this);
            });
        };

        var loadSolution = function(callback) {
            project.getProgramCode("solution.tgr", function(result) {
                if (!(result instanceof TError)) {
                    solutionCode = result;
                }
                callback.call(this);
            });
        };
        
        this.load = function(callback) {
            checkStatements = false;
            startStatements = false;
            solutionCode = false;
            instructions = false;
            hints = false;
            
            project.init(function() {
                // 1st check existing programs
                var programs = project.getProgramsNames();
                var startPresent = false;
                var checkPresent = false;
                var solutionPresent = false;
                var toLoad = 0;
                
                if (programs.indexOf("start.tgr") > -1) {
                    toLoad++;
                    startPresent = true;
                }

                if (programs.indexOf("check.tgr") > -1) {
                    toLoad++;
                    checkPresent = true;
                }

                if (programs.indexOf("solution.tgr") > -1) {
                    toLoad++;
                    solutionPresent = true;
                }
                
                // 2nd check existing resources
                var resources = project.getResourcesNames();
                if (resources.indexOf("instructions.html") > -1) {
                    instructions = true;
                }

                if (programs.indexOf("hints.html") > -1) {
                    hints = true;
                }

                // 3rd load statements
                var checkLoad = function() {
                    toLoad--;
                    if (toLoad===0) {
                        callback.call(this);
                    }
                };
                if (startPresent) {
                    loadStart(checkLoad);
                }
                if (checkPresent) {
                    loadCheck(checkLoad);
                }
                if (solutionPresent) {
                    loadSolution(checkLoad);
                }
            });
            
        };
    }
    
    return TExercise;
});