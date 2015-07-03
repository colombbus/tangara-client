define(['TLink', 'TProgram', 'TEnvironment', 'utils/TUtils', 'TError'], function(TLink, TProgram, TEnvironment, TUtils, TError) {
    function TLearnProject() {
        
        var name;
        var id;
        var resourcesNames = [];
        var resources = {};
        
        var step;

        this.setName = function(value) {
            name = value;
        };

        this.getName = function() {
            return name;
        };

        this.setId = function(value) {
            id = value;
        };

        this.getId = function() {
            return id;
        };

        this.isProgramEdited = function(name) {
            return false;
        };
        
        this.setStep = function(value) {
            step = value;
        };

        this.getResourcesNames = function() {
            return resourcesNames;
        };
        
        this.getResources = function() {
            return resources;
        };
        
        this.getResourceLocation = function(name) {
            return TEnvironment.getResource("steps/"+step+"/"+name);
        };

        this.getResourceBaseName = function(name) {
            return resources[name]['base-name'];
        };
        
        this.isUnsaved = function() {
            return false;
        };
        
        
    }
    
    return TLearnProject;

});

