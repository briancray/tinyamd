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
        if (settings.toString.call(id) === '[object Array]') {
            factory = dependencies;
            dependencies = id;
            id = null;
        }
        else {
            factory = dependencies;
            dependencies = ['require', 'exports', 'module'];
        }
    }

    if (!id) {
        anonymous_queue.push([dependencies, factory]);
        return;
    }

    function ready () {
        var handlers, context, module;
        if (exports[id]) {
            handlers = exports[id].handlers;
            context = exports[id].context;
        }
        module = exports[id] = typeof factory === 'function' ? factory.apply(null, anonymous_queue.slice.call(arguments, 0)) || exports[id] || {} : factory;
        module.tinyamd = 2;
        module.context = context;
        for (var x = 0, xl = handlers ? handlers.length : 0; x < xl; x++) {
            handlers[x](module);
        }
    };

    require(dependencies, ready, id);
};

define.amd = {};

function require (modules, callback, context) {
    var loaded_modules = [], loaded_count = 0, has_loaded = false;

    if (typeof modules === 'string') {
        if (exports[modules] && exports[modules].tinyamd === 2) {
            return exports[modules];
        }   
        throw new Error(modules + ' has not been defined. Please include it as a dependency in ' + context + '\'s define()');
        return;
    }

    for (var x = 0, xl = modules.length; x < xl; x++) {
        switch (modules[x]) {
            case 'require':
                var _require = function (new_module, callback) {
                    return require(new_module, callback, context);
                };  
                _require.toUrl = function (module) {
                    return toUrl(module, context);
                };  
                loaded_modules[x] = _require;
                loaded_count++;
                break;
            case 'exports':
                loaded_modules[x] = exports[context] || (exports[context] = {});
                loaded_count++;
                break;
            case 'module':
                loaded_modules[x] = { 
                    id: context,
                    uri: toUrl(context)
                };  
                loaded_count++;
                break;
            case exports[context] ? exports[context].context : '':
                loaded_modules[x] = exports[exports[context].context];
                loaded_count++;
                break;
            default:
                (function (x) {
                    load(modules[x], function (def) {
                        loaded_modules[x] = def;
                        loaded_count++;
                        loaded_count === xl && callback && (has_loaded = true, callback.apply(null, loaded_modules));
                    }, context);
                })(x);
        };  
    }
    !has_loaded && loaded_count === xl && callback && callback.apply(null, loaded_modules); 
}

function load (module, callback, context) {
    module = context ? toUrl(module, context) : module;
     
    if (exports[module]) {
        if (exports[module].tinyamd === 1) {
            callback && exports[module].handlers.push(callback);
        }
        else {
            callback && callback(exports[module]);
        }
        return;
    }
    else {
        exports[module] = {
            tinyamd: 1,
            handlers: [callback],
            context: context
        };
    }
    
    inject(toUrl(module) + '.js', function () {
        var queue_item;
        if (queue_item = anonymous_queue.shift()) {
            queue_item.unshift(module);
            exports[module].tinyamd === 1 && define.apply(null, queue_item);
        }
    });
};

var toUrl = require.toUrl = function (id, context) {
    var new_context, i, changed;
    switch (id) {
        case 'require':
        case 'exports':
        case 'module':
            return id;
    }
    new_context = (context || settings.baseUrl).split('/');
    new_context.pop();
    id = id.split('/');
    i = id.length;
    while (--i) {
        switch (id[0]) {
            case '..':
                new_context.pop();
            case '.':
            case '':
                id.shift();
                changed = true;
        }
    }
    return (new_context.length && changed ? new_context.join('/') + '/' : '') + id.join('/');
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

main && require([main]);

})(this);
