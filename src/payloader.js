/*jshint browser:true */
(function(global) {
    "use strict";

    var _config = {};

    function Module(name) {
        this.name = name;
        this.deps = {};
    }

    Module.prototype = {
        requires : function(name, alias) {
            this.deps[name] = alias || name;

            return this;
        },

        body : function(fn) {
            this._fn = fn;

            return this;
        }
    };

    function payloader(name) {
        return (new Module(name));
    }

    payloader.config = function() {
        var args = Array.prototype.slice.apply(arguments);

        if(!args.length) {
            return _config;
        }

        args.forEach(function(config) {
            var key;

            for(key in config) {
                _config[key] = config[key];
            }
        });
    };

if(typeof module !== "undefined" && module.exports) {
    module.exports = payloader;
} else {
    global.payloader = payloader;
}
}((function() { return this; }())));
