;(function (global, undefined) {
"use strict";

var doc = document;
var el_head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
var node = (function (scripts) {
    return scripts[scripts.length - 1];
})(doc.getElementsByTagName('script'));
var main = node.getAttribute('data-main');
var anonymous_queue = [];
var settings = {
    baseUrl: (function (href) {
        var place = href.split('/').slice(0, 3).join('/');
        var path;
        if (main) {
            if (main.slice(0, place.length) === place) {
                path = main;
            }
            else if (main[0] === '/') {
                path = place + main;
            }
            else {
                path = href.slice(0, href.lastIndexOf('/') + 1) + main;
            }
            main = main.slice(main.lastIndexOf('/') + 1);
        }
        else {
            path = href;
        }
        return path.slice(0, path.lastIndexOf('/') + 1);
    })(global.location.href.split('?')[0])
};
var exports = {};

function config (config) {
    if (typeof config === 'object') {
        for (var x in config) {
            config.hasOwnProperty(x) && (settings[x] = config[x]);
        }
    }
};

function define (id, dependencies, factory) {
    var arg_count = arguments.length;

    if (arg_count === 1) {
        factory = id;
        dependencies = ['require', 'exports', 'module'];
        id = null;
    }
    else if (arg_count === 2) {
        if (tinyamd.toString.call(id) === '[object Array]') {
            factory = dependencies;
            dependencies = id;
            id = null;
        }
        else {
            factory = dependencies;
            dependencies = ['require', 'exports', 'module'];
        }
    }
    else if (!dependencies.length) {
        dependencies = ['require', 'exports', 'module'];
    }

    if (!id) {
        anonymous_queue.push([dependencies, factory]);
        return;
    }

    function ready () {
        var handlers = exports[id].handlers;
        var context = exports[id].context;
        var module = exports[id] = typeof factory === 'function' ? factory.apply(null, anonymous_queue.slice.call(arguments, 0)) || exports[id] : factory;
        module.tinyamd = 2;
        module.context = context;
        handlers.length && handlers.forEach(function (handler) {
            handler && handler(module);
        });
    };

    dependencies = dependencies.map(function (dependency) {
        return toUrl(dependency, id);
    });

    require(dependencies, ready, id);
};

define.amd = {};

function require (module, callback, context) {
    var loaded_modules = [];

    if (tinyamd.toString.call(module) === '[object Array]') {
        module.forEach(function (m, i) {
            switch (m) {
                case 'require':
                    var _require = function (new_module, callback) {
                        var modules = (typeof new_module === 'string' ? [new_module] : new_module).map(function (m) {
                            m = toUrl(m, context);
                        });
                        return require(new_module, callback, context);
                    };
                    _require.toUrl = toUrl;
                    loaded_modules[i] = _require;
                    break;
                case 'exports':
                    loaded_modules[i] = exports[context];
                    break;
                case 'module':
                    loaded_modules[i] = {
                        id: context,
                        uri: toUrl(context)
                    };
                    break;
                case exports[context] ? exports[context].context : undefined:
                    loaded_modules[i] = exports[exports[context].context];
                    break;
                default:
                    require(m, function (def) {
                        loaded_modules[i] = def;
                        loaded_modules.length === module.length && callback.apply(null, loaded_modules);
                    }, context);
                    return;
            }
            if (loaded_modules.length === module.length) {
                callback.apply(null, loaded_modules);
            }
        });
        return;
    }
     
    if (exports[module]) {
        if (exports[module].tinyamd === 1) {
            callback && exports[module].handlers.push(callback);
        }
        else {
            callback && callback(exports[module]);
        }
        return exports[module];
    }
    else {
        exports[module] = {
            tinyamd: 1,
            handlers: [callback],
            context: context
        };
    }
    
    inject(toUrl(module), function () {
        var queue_item;
        if (queue_item = anonymous_queue.shift()) {
            queue_item.unshift(module);
            exports[module].tinyamd === 1 && define.apply(null, queue_item);
        }
    });
};

var toUrl = require.toUrl = function (id, context) {
    var new_context, i;
    switch (id) {
        case 'require':
        case 'exports':
        case 'module':
            return id;
    }
    new_context = (context || settings.baseUrl).split('/').slice(0, -1);
    id = id.split('/');
    i = id.length;
    while (--i) {
        switch (id[0]) {
            case '..':
                new_context.slice(0, -1)
                id.slice(1);
            break;
            case '.':
            case '':
                id.slice(1);
        }
    }
    return (new_context.length ? new_context.join('/') + '/' : '') + id.join('/') + (context === undefined && id[id.length - 1].indexOf('.') === -1 ? '.js' : '');
};

function inject (file, callback) {
    var script = doc.createElement('script');
    script.onload = script.onreadystatechange = function () {
        if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
            script.onload = script.onreadystatechange = null;
            el_head.removeChild(script);
            callback && callback();
        }
    };
    script.type = 'text/javascript';
    script.async = true;
    script.src = file;
    el_head.appendChild(script);
};

global.tinyamd = {
    config: config,
    inject: inject,
    define: global.define = define,
    require: global.require = require,
    exports: exports
};

main && require(main);

})(this);
