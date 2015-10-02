define(['jquery'], function($) {
    var TResource = function() {
        var cacheEnabled = false;
        var MILISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
        
        /*
         * Set cache support (i.e. use of localStorage)
         * If true, check validity of cached data, ensuring that it is no older than 1 day
         * @param {boolean} value
         */
        this.setCacheEnabled = function(value) {
            cacheEnabled = value;
            if (cacheEnabled) {
                // check validity of data
                var oldTimeStamp = localStorage.getItem("timestamp");
                var timeStamp = (new Date()).getTime();
                if (oldTimeStamp) {
                    if (timeStamp - oldTimeStamp > MILISECONDS_PER_DAY) {
                        // More than one day has elapsed: we clear the cache
                        localStorage.clear();
                    } else {
                        timeStamp = oldTimeStamp;
                    }
                }
                try {
                    localStorage.setItem("timestamp", timeStamp);
                } catch (e) {
                    // in case setItem throws an exception (e.g. private mode)
                    // set cacheEnabled to false
                    cacheEnabled = false;
                }                
            }
            return cacheEnabled;
        };
        
        /*
         * Get value from a JSON resource file
         * @param {String} name the name of resource file
         * @param {Array} fields the fields to retrieve from resource file. If empty, returns all file content
         * @param {Function} callback
         */
        this.get = function(name, fields, callback) {
            if (cacheEnabled) {
                // try to retrieve value from local storage
                var value = localStorage.getItem(name);
                if (value) {
                    // value is available from local storage
                    callback.call(this,JSON.parse(value));
                    return;
                }
            }
            $.ajax({
                dataType: "json",
                url: name,
                success: function(data) {
                    var value;
                    if (fields.length>0) {
                        value = {};
                        for (var i=0; i<fields.length; i++) {
                            if (typeof data[fields[i]] !== 'undefined') {
                                value[fields[i]] = data[fields[i]];
                                window.console.log("found field '"+fields[i]+"' in resource '"+name);
                            }
                        }
                    } else {
                        value = data;
                    }
                    if (cacheEnabled) {
                        try  {
                            localStorage.setItem(name,JSON.stringify(value));
                        } catch (e) {
                            window.console.error("Error trying to cache value "+value+": "+e);
                        }
                    }
                    callback.call(this, value);
                },
                error: function(data, status, error) {
                    window.console.error("Error loading resource '"+name+"'");
                    callback.call(this, {});
                }
            });
        };
        
        
         /*
         * Get value from a text resource file
         * @param {String} name the name of resource file
         * @param {Function} callback
         */
        this.getPlain = function(name, callback) {
            if (cacheEnabled) {
                // try to retrieve value from local storage
                var value = localStorage.getItem(name);
                if (value) {
                    // value is available from local storage
                    // postpone callback execution
                    setTimeout(function() {
                        callback.call(this,value);
                    }, 0);
                    return;
                }
            }
            $.ajax({
                dataType: "text",
                url: name,
                success: function(data) {
                    if (cacheEnabled) {
                        try {
                            localStorage.setItem(name,data);
                        } catch (e) {
                            window.console.error("Error trying to cache value "+data+": "+e);
                        }

                    }
                    callback.call(this, data);
                },
                error: function(data, status, error) {
                    window.console.error("Error loading resource '"+name+"'");
                    callback.call(this, "");
                }
            });
        };
    };
    
    var resourceInstance = new TResource();
    
    return resourceInstance;
});
