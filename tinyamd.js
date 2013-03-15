;(function (global) {
"use strict";

var doc = document;
var el_head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
var module_scripts = el_head.getElementsByClassName('tinyamd-module');
var node = (function (scripts) {
    return scripts[scripts.length - 1];
})(doc.getElementsByTagName('script'));
var main = node.getAttribute('data-main');
var anonymous_queue = [];
var settings = {
    working_path: (function (href) {
        var href = global.location.href.split('?')[0];
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
    })(global.location.href),
    baseUrl: ''
};

var tinyamd = {
    config: function (config) {
        if (typeof config === 'object') {
            for (var x in config) {
                config.hasOwnProperty(x) && (settings[x] = config[x]);
            }
        }
    },
    define: function (id, dependencies, factory) {
        var arg_count = arguments.length;
        var exports = tinyamd.exports;

        if (typeof id === 'string' && exports[id] && exports[id].tinyamd === 2) {
            return;
        }
        else if (arg_count <= 2) {
            if (arg_count === 1) {
                factory = id;
                dependencies = ['require', 'exports', 'module'];
                id = null;
            }
            else {
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
        }

        if (!id) {
            anonymous_queue.push([dependencies, factory]);
            return;
        }

        function ready () {
            var handlers = exports[id].handlers;
            var module = exports[id] = typeof factory === 'function' ? factory.apply(null, arguments) : factory;
            module.tinyamd = 2;
            handlers && handlers.forEach(function (handler) {
                handler && handler(module);
            });
        };

        dependencies = dependencies.map(function (dependency) {
            return tinyamd.require.toUrl(dependency, id);
        }); 

        tinyamd.require(dependencies, ready);
    },
    require: function (module, callback) {
        var loaded, loaded_modules;
        var exports = tinyamd.exports;

        if (tinyamd.toString.call(module) === '[object Array]') {
            loaded = 0;
            loaded_modules = [];
            module.filter(function (m) {
                return m && typeof m === 'string';
            }).forEach(function (m, i) {
                m && typeof m === 'string' && tinyamd.require(m, function (def) {
                    loaded_modules[i] = def;
                    ++loaded === module.length && callback.apply(null, loaded_modules);
                });
            });
            return;
        }
        else if (!module || typeof module !== 'string') {
            return;
        }
        else {
            switch (module) {
                case 'require':
                    return callback(function (new_module, callback) {
                        tinyamd.require(tinyamd.require.toUrl(new_module, module), callback);
                    });
                case 'exports':
                    return callback(exports);
                case 'module':
                    return callback({});
            }
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
                handlers: [callback]
            };
        }

        tinyamd.inject(settings.working_path + settings.baseUrl + module + '.js', function () {
            var queue_item;
            if (queue_item = anonymous_queue.shift()) {
                queue_item.unshift(module);
                exports[module].tinyamd === 1 && tinyamd.define.apply(null, queue_item);
            }
        });
    },
    inject: function (file, callback) {
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
        script.className = 'tinyamd-module';
        script.src = file;
        el_head.appendChild(script);
    },
    exports: {}
};

tinyamd.define.amd = {};

tinyamd.require.toUrl = function (id, context) {
    context = (context || settings.baseUrl).split('/').slice(0, -1);
    if (!context[0] || id.indexOf('.') === -1) {
        return id;
    }
    id = id.split('/');
    var i = id.length;
    while (--i) {
        switch (id[0]) {
            case '..':
                context.pop();
                id.shift();
            break;
            case '.':
            case '':
                id.shift();
        }
    }
    return context.length ? context.join('/') + '/' + id.join('/') : id.join('/');
};

global.define = tinyamd.define;
global.require = tinyamd.require;
global.tinyamd = tinyamd;

main && tinyamd.require(main);

})(this);
