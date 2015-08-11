define(['TLink', 'TProgram', 'TEnvironment', 'TUtils', 'TError'], function(TLink, TProgram, TEnvironment, TUtils, TError) {
    /**
     * TLearnProject is like TProject, but adapted to "Learn" part of Declick.
     * (Learn Project will be refered later as LP)
     * @exports TLearnProject
     */
    function TLearnProject() {

        var name;
        var id;
        var resourcesNames = [];
        var resources = {};

        var step;

        /**
         * Set LP's name.
         * @param {String} value
         */
        this.setName = function(value) {
            name = value;
        };

        /**
         * Returns LP's name.
         * @returns {String}
         */
        this.getName = function() {
            return name;
        };

        /**
         * Set LP's ID.
         * @param {String} value
         */
        this.setId = function(value) {
            id = value;
        };

        /**
         * Returns LP's ID.
         * @returns {String
         */
        this.getId = function() {
            return id;
        };

        /**
         * TBD
         * Returns false.
         * @param {String} name
         * @returns {Boolean}
         */
        this.isProgramEdited = function(name) {
            return false;
        };

        /**
         * Set step to value.
         * @param {String} value
         */
        this.setStep = function(value) {
            step = value;
        };

        /**
         * Returns resources name.
         * @returns {String[]}
         */
        this.getResourcesNames = function() {
            return resourcesNames;
        };

        /**
         * Returns resources.
         * @returns {Resources[]}
         */
        this.getResources = function() {
            return resources;
        };

        /**
         * Get the location of 'name' resource.
         * @param {String} name
         */
        this.getResourceLocation = function(name) {
            return TEnvironment.getResource("steps/" + step + "/" + name);
        };

        /**
         * Return base name of 'name' resource.
         * @return {String}
         */
        this.getResourceBaseName = function(name) {
            return resources[name]['base-name'];
        };

        /**
         * TBD
         * Returns false.
         * @returns {Boolean}
         */
        this.isUnsaved = function() {
            return false;
        };


    }

    return TLearnProject;

});
