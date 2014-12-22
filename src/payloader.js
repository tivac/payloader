/*jshint browser:true */
(function(global) {
    "use strict";

    var _config = {};

    function _resolve(modules) {
        var required = [],
            modified, i, module, loc;

        do {
            modified = false;

            for(i = 0; i < modules.length; i++) {
                module = _config[modules[i]];

                // Unknown or already included module
                if(!module || required.indexOf(modules[i]) > -1) {
                    continue;
                }

                loc = required.push(modules[i]);
                loc--;

                if(!module.requires) {
                    continue;
                }

                /*jshint -W083 */
                module.requires.forEach(function(require) {
                    var pos    = required.indexOf(require),
                        insert = Math.min(loc - 1, 0);

                    // Already in an appropriate spot
                    if(pos < loc && pos !== -1) {
                        return;
                    }

                    modified = true;

                    // Not already required, so insert ahead of current module
                    if(pos === -1) {
                        return required.splice(insert, 0, require);
                    }

                    // Already in the array, but after this module. Shift earlier.
                    if(pos > loc) {
                        required.splice(insert, 0, required.splice(pos, 1)[0]);
                    }
                });
                /*jshint +W083 */
            }
        } while(modified);

        return required;
    }

    function _load(url, done) {
        var xhr = new XMLHttpRequest();
        
        xhr.open("GET", url);

        xhr.onreadystatechange = function() {
            if(xhr.readyState !== 4) {
                return;
            }

            if(xhr.status !== 200) {
                return done(xhr);
            }
            
            done(null, {
                src  : xhr.responseText,
                type : xhr.getResponseHeader("content-type")
            });
        };
        
        xhr.send();
    }

    function Module(name) {
        this.name = name;
        this.deps = {};
    }
    
    Module.prototype = {
        requires: function(name, alias) {
            this.deps[name] = alias || name;
            return this;
        },

        body: function(fn) {
            this._fn = fn;
            return this;
        }
    };

    function payloader(name) {
        return (new Module(name));
    }
    
    payloader.config = function() {
        if(!arguments.length) {
            return _config;
        }

        Array.prototype.slice.apply(arguments).forEach(function(config) {
            var key;
            for (key in config) {
                if(typeof config[key] === "string") {
                    _config[key] = {
                        url : config[key]
                    };

                    continue;
                }
                
                _config[key] = config[key];
            }
        });
    };
    
    payloader.load = function() {
        if(!arguments.length) {
            return false;
        }

        var modules = Array.prototype.slice.apply(arguments),
            done    = typeof modules[modules.length - 1] === "function" ? modules.pop() : null;

        modules = _resolve(modules);

        modules.forEach(function(module) {
            if(!(module in _config)) {
                return;
            }

            _load(_config[module].url, function(error, data) {
                if(error) {
                    throw new Error("Unable to load " + module + " (" + _config[module].url + ")");
                }
                
                console.log(data); //TODO: REMOVE DEBUGGING
            });
        });
    };
    
    if(typeof module !== "undefined" && module.exports) {
        module.exports = payloader;
    } else {
        global.payloader = payloader;
    }
}((function() {
    /*jshint strict:false */
    return this;
}())));
